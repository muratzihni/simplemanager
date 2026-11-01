"""HTTP istemcisi: hız sınırı, üstel geri çekilme ile yeniden deneme, önbellek, sayfalama.

API anahtarları başlıklarda taşınır; önbellek anahtarına, günlüklere ve hata mesajlarına GİRMEZ.
"""
from __future__ import annotations

import hashlib
import json
import random
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import deque
from dataclasses import dataclass
from typing import Any, Callable, Iterator

Transport = Callable[[str, str, dict, float], "tuple[int, dict, bytes]"]


class HttpError(Exception):
    def __init__(self, status: int, url: str, message: str = ""):
        super().__init__(f"HTTP {status} {url} {message}".strip())
        self.status = status
        self.url = url


class AuthError(HttpError):
    pass


class NotFoundError(HttpError):
    pass


class NetworkError(Exception):
    pass


class DailyQuotaExhausted(Exception):
    """Günlük istek bütçesi bitti; saatlerce beklemek yerine işlem durdurulur."""


@dataclass
class RateLimit:
    per_minute: int | None = None
    per_day: int | None = None


def urllib_transport(method: str, url: str, headers: dict, timeout: float) -> tuple[int, dict, bytes]:
    req = urllib.request.Request(url, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, {k.lower(): v for k, v in resp.headers.items()}, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in (e.headers or {}).items()}, e.read() if e.fp else b""
    except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:
        raise NetworkError(str(e)) from e


class SqliteCache:
    """Basit TTL önbelleği. path=':memory:' testlerde kullanılır."""

    def __init__(self, path: str = ":memory:", clock: Callable[[], float] = time.time):
        self._db = sqlite3.connect(path, check_same_thread=False)
        self._db.execute("CREATE TABLE IF NOT EXISTS http_cache (k TEXT PRIMARY KEY, fetched_at REAL NOT NULL, body BLOB NOT NULL)")
        self._clock = clock

    def get(self, key: str, ttl: float) -> bytes | None:
        row = self._db.execute("SELECT fetched_at, body FROM http_cache WHERE k = ?", (key,)).fetchone()
        if row and self._clock() - row[0] <= ttl:
            return row[1]
        return None

    def put(self, key: str, body: bytes) -> None:
        self._db.execute("INSERT OR REPLACE INTO http_cache(k, fetched_at, body) VALUES (?,?,?)", (key, self._clock(), body))
        self._db.commit()


class HttpClient:
    RETRY_STATUS = {429, 500, 502, 503, 504}

    def __init__(self, base_url: str, headers: dict | None = None, rate: RateLimit | None = None,
                 cache: SqliteCache | None = None, transport: Transport | None = None,
                 max_retries: int = 5, backoff_base: float = 1.0, backoff_cap: float = 60.0,
                 max_retry_after: float = 120.0, timeout: float = 30.0,
                 sleeper: Callable[[float], None] = time.sleep, clock: Callable[[], float] = time.monotonic,
                 wall_clock: Callable[[], float] = time.time, rng: random.Random | None = None):
        self.base_url = base_url.rstrip("/")
        self._headers = dict(headers or {})
        self.rate = rate or RateLimit()
        self.cache = cache
        self.transport = transport or urllib_transport
        self.max_retries = max_retries
        self.backoff_base = backoff_base
        self.backoff_cap = backoff_cap
        self.max_retry_after = max_retry_after
        self.timeout = timeout
        self._sleep = sleeper
        self._clock = clock
        self._wall = wall_clock
        self._rng = rng or random.Random()
        self._minute: deque[float] = deque()
        self._day_key: int | None = None
        self._day_count = 0
        self.requests_made = 0

    # --- hız sınırı -------------------------------------------------------------------------
    def _throttle(self) -> None:
        day = int(self._wall() // 86400)
        if day != self._day_key:
            self._day_key, self._day_count = day, 0
        if self.rate.per_day is not None and self._day_count >= self.rate.per_day:
            raise DailyQuotaExhausted(f"günlük istek sınırı ({self.rate.per_day}) doldu")
        if self.rate.per_minute is not None:
            now = self._clock()
            while self._minute and now - self._minute[0] >= 60:
                self._minute.popleft()
            if len(self._minute) >= self.rate.per_minute:
                wait = 60 - (now - self._minute[0])
                if wait > 0:
                    self._sleep(wait)
                now = self._clock()
                while self._minute and now - self._minute[0] >= 60:
                    self._minute.popleft()
            self._minute.append(self._clock())
        self._day_count += 1

    def _backoff(self, attempt: int, retry_after: float | None) -> float:
        if retry_after is not None:
            return min(retry_after, self.max_retry_after)
        raw = min(self.backoff_cap, self.backoff_base * (2 ** attempt))
        return raw * (0.5 + self._rng.random() * 0.5)

    # --- istekler ---------------------------------------------------------------------------
    def _url(self, path: str, params: dict | None) -> str:
        url = path if path.startswith("http") else f"{self.base_url}/{path.lstrip('/')}"
        if params:
            clean = {k: v for k, v in params.items() if v is not None}
            url += ("&" if "?" in url else "?") + urllib.parse.urlencode(sorted(clean.items()))
        return url

    @staticmethod
    def _cache_key(url: str) -> str:
        return hashlib.sha256(url.encode()).hexdigest()   # başlıklar (API anahtarı) anahtara girmez

    def get_json(self, path: str, params: dict | None = None, ttl: float | None = None) -> Any:
        url = self._url(path, params)
        key = self._cache_key(url)
        if self.cache and ttl:
            hit = self.cache.get(key, ttl)
            if hit is not None:
                return json.loads(hit)
        last_exc: Exception | None = None
        for attempt in range(self.max_retries + 1):
            self._throttle()
            self.requests_made += 1
            try:
                status, headers, body = self.transport("GET", url, self._headers, self.timeout)
            except NetworkError as e:
                last_exc = e
                if attempt >= self.max_retries:
                    break
                self._sleep(self._backoff(attempt, None))
                continue
            if status == 200:
                if self.cache and ttl:
                    self.cache.put(key, body)
                try:
                    return json.loads(body)
                except ValueError as e:
                    raise HttpError(status, url, "geçersiz JSON") from e
            if status in (401, 403):
                raise AuthError(status, url, "kimlik doğrulama/izin hatası (anahtar ya da plan kapsamı)")
            if status == 404:
                raise NotFoundError(status, url)
            if status in self.RETRY_STATUS and attempt < self.max_retries:
                ra = headers.get("retry-after")
                try:
                    ra_val = float(ra) if ra is not None else None
                except ValueError:
                    ra_val = None
                self._sleep(self._backoff(attempt, ra_val))
                last_exc = HttpError(status, url)
                continue
            raise HttpError(status, url)
        raise NetworkError(f"{self.max_retries + 1} denemeden sonra başarısız: {last_exc}")

    def paginate(self, path: str, params: dict | None, total_pages: Callable[[Any], int],
                 page_param: str = "page", ttl: float | None = None, max_pages: int = 500) -> Iterator[Any]:
        page = 1
        while page <= max_pages:
            body = self.get_json(path, {**(params or {}), page_param: page}, ttl=ttl)
            yield body
            if page >= max(1, int(total_pages(body) or 1)):
                return
            page += 1
