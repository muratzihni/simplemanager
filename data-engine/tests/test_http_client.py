import json
import random
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

from fmdata.http_client import (AuthError, DailyQuotaExhausted, HttpClient, HttpError, NetworkError, NotFoundError, RateLimit,
                                SqliteCache, urllib_transport)


def scripted(responses):
    """Sırayla (durum, başlıklar, gövde) döndüren sahte taşıyıcı."""
    calls = []

    def transport(method, url, headers, timeout):
        calls.append((url, dict(headers)))
        item = responses[min(len(calls) - 1, len(responses) - 1)]
        if isinstance(item, Exception):
            raise item
        status, hdrs, body = item
        return status, hdrs, json.dumps(body).encode()
    transport.calls = calls
    return transport


class Clock:
    def __init__(self):
        self.t = 1_000_000.0
        self.sleeps = []

    def sleep(self, s):
        self.sleeps.append(s)
        self.t += s

    def now(self):
        return self.t


def client(transport, clock=None, **kw):
    clock = clock or Clock()
    return HttpClient("http://x", headers={"x-secret-key": "TOP-SECRET"}, transport=transport, sleeper=clock.sleep,
                      clock=clock.now, wall_clock=clock.now, rng=random.Random(1), **kw), clock


class HttpClientTests(unittest.TestCase):
    def test_retry_after_is_honored_then_success(self):
        tr = scripted([(429, {"retry-after": "7"}, {}), (503, {}, {}), (200, {}, {"ok": 1})])
        c, clock = client(tr)
        self.assertEqual(c.get_json("a"), {"ok": 1})
        self.assertEqual(len(tr.calls), 3)
        self.assertEqual(clock.sleeps[0], 7.0)
        self.assertTrue(0.5 <= clock.sleeps[1] <= 2.0)   # üstel geri çekilme (deneme 1: 2s * [0.5,1])

    def test_backoff_grows_and_is_capped(self):
        tr = scripted([(500, {}, {})] * 8)
        c, clock = client(tr, max_retries=6, backoff_base=1.0, backoff_cap=8.0)
        with self.assertRaises(HttpError):
            c.get_json("a")
        self.assertEqual(len(tr.calls), 7)
        self.assertTrue(all(s <= 8.0 for s in clock.sleeps))
        self.assertLess(clock.sleeps[0], clock.sleeps[3] + 1e-9 + 8)   # artış eğilimi
        self.assertTrue(max(clock.sleeps) > 2.0)

    def test_auth_and_not_found_do_not_retry(self):
        tr = scripted([(401, {}, {})])
        c, _ = client(tr)
        with self.assertRaises(AuthError):
            c.get_json("a")
        self.assertEqual(len(tr.calls), 1)
        tr = scripted([(404, {}, {})])
        c, _ = client(tr)
        with self.assertRaises(NotFoundError):
            c.get_json("a")
        self.assertEqual(len(tr.calls), 1)

    def test_network_errors_are_retried_then_reported(self):
        tr = scripted([NetworkError("bağlantı yok")] * 5)
        c, _ = client(tr, max_retries=2)
        with self.assertRaises(NetworkError):
            c.get_json("a")
        self.assertEqual(len(tr.calls), 3)

    def test_per_minute_rate_limit_sleeps(self):
        tr = scripted([(200, {}, {"ok": 1})])
        c, clock = client(tr, rate=RateLimit(per_minute=2))
        c.get_json("a")
        c.get_json("b")
        self.assertEqual(clock.sleeps, [])
        c.get_json("c")                      # 3. istek pencereyi doldurur: bekler
        self.assertEqual(len(clock.sleeps), 1)
        self.assertAlmostEqual(clock.sleeps[0], 60.0, delta=1.0)

    def test_daily_quota_raises_instead_of_sleeping(self):
        tr = scripted([(200, {}, {"ok": 1})])
        c, clock = client(tr, rate=RateLimit(per_day=2))
        c.get_json("a")
        c.get_json("b")
        with self.assertRaises(DailyQuotaExhausted):
            c.get_json("c")
        self.assertEqual(clock.sleeps, [])

    def test_cache_hit_skips_network_and_never_stores_secrets(self):
        tr = scripted([(200, {}, {"v": 1}), (200, {}, {"v": 2})])
        cache = SqliteCache(":memory:", clock=lambda: 100.0)
        c, _ = client(tr, cache=cache)
        self.assertEqual(c.get_json("p", {"x": 1}, ttl=60), {"v": 1})
        self.assertEqual(c.get_json("p", {"x": 1}, ttl=60), {"v": 1})
        self.assertEqual(len(tr.calls), 1)
        dump = " ".join(str(r) for r in cache._db.execute("SELECT * FROM http_cache"))
        self.assertNotIn("TOP-SECRET", dump)
        self.assertEqual(c.get_json("p", {"x": 2}, ttl=60), {"v": 2})   # farklı parametre = farklı anahtar

    def test_pagination(self):
        pages = [(200, {}, {"paging": {"current": i, "total": 3}, "response": [i]}) for i in (1, 2, 3)]
        tr = scripted(pages)
        c, _ = client(tr)
        got = [b["response"][0] for b in c.paginate("players", {"team": 1}, total_pages=lambda b: b["paging"]["total"])]
        self.assertEqual(got, [1, 2, 3])
        self.assertIn("page=3", tr.calls[2][0])

    def test_real_http_over_localhost(self):
        """Gerçek HTTP (yerel sunucu): urllib taşıyıcısı, 429 + Retry-After, başlık iletimi."""
        state = {"n": 0, "seen_key": None}

        class H(BaseHTTPRequestHandler):
            def do_GET(self):
                state["n"] += 1
                state["seen_key"] = self.headers.get("x-secret-key")
                if state["n"] == 1:
                    self.send_response(429)
                    self.send_header("Retry-After", "0")
                    self.end_headers()
                    return
                body = json.dumps({"hello": "world"}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *a):
                pass

        srv = HTTPServer(("127.0.0.1", 0), H)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        try:
            c = HttpClient(f"http://127.0.0.1:{srv.server_port}", headers={"x-secret-key": "K"}, transport=urllib_transport,
                           sleeper=lambda s: None)
            self.assertEqual(c.get_json("anything"), {"hello": "world"})
            self.assertEqual(state["n"], 2)
            self.assertEqual(state["seen_key"], "K")
        finally:
            srv.shutdown()
            srv.server_close()

    def test_unreachable_host_reports_network_error(self):
        c = HttpClient("http://127.0.0.1:1", transport=urllib_transport, max_retries=1, sleeper=lambda s: None, timeout=1)
        with self.assertRaises(NetworkError):
            c.get_json("x")


if __name__ == "__main__":
    unittest.main()
