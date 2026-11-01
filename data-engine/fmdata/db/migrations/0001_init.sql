-- Futbol veri motoru şeması (SQLite). Tüm tarihler ISO-8601 metin (YYYY-MM-DD veya UTC zaman damgası).
-- NULL = "kaynakta yok / bilinmiyor". Eksik alanlar uydurulmaz.

CREATE TABLE data_sources (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  base_url TEXT,
  license_note TEXT,
  allows_redistribution INTEGER CHECK (allows_redistribution IN (0,1)),   -- NULL = doğrulanmadı
  created_at TEXT NOT NULL
);

CREATE TABLE countries (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE,                       -- ISO benzeri; kaynakta yoksa NULL
  name TEXT NOT NULL UNIQUE,
  confederation TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE competitions (
  id INTEGER PRIMARY KEY,
  country_id INTEGER REFERENCES countries(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('league','cup','super_cup','international','other')),
  tier INTEGER,
  organizer TEXT,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_competitions ON competitions(COALESCE(country_id,0), name, type);

CREATE TABLE seasons (
  id INTEGER PRIMARY KEY,
  competition_id INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,                    -- örn. 2026-27
  start_date TEXT,
  end_date TEXT,
  UNIQUE (competition_id, label)
);

CREATE TABLE clubs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  tla TEXT,
  country_id INTEGER REFERENCES countries(id) ON DELETE RESTRICT,
  city TEXT,
  founded_year INTEGER CHECK (founded_year IS NULL OR founded_year BETWEEN 1800 AND 2100),
  stadium_name TEXT,
  stadium_capacity INTEGER CHECK (stadium_capacity IS NULL OR stadium_capacity > 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  confidence REAL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  last_checked_at TEXT,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_clubs_name ON clubs(COALESCE(country_id,0), name);

CREATE TABLE club_competitions (
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  PRIMARY KEY (club_id, season_id)
);

CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  birth_date TEXT,
  nationality TEXT,
  second_nationality TEXT,
  height_cm INTEGER CHECK (height_cm IS NULL OR height_cm BETWEEN 120 AND 230),
  weight_kg INTEGER CHECK (weight_kg IS NULL OR weight_kg BETWEEN 40 AND 150),
  preferred_foot TEXT CHECK (preferred_foot IS NULL OR preferred_foot IN ('left','right','both')),
  primary_position TEXT,
  alt_positions TEXT,                     -- JSON dizi
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  confidence REAL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  last_checked_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX ix_players_norm ON players(normalized_name);
CREATE INDEX ix_players_birth ON players(birth_date);

CREATE TABLE player_identities (            -- takma adlar / yazım varyantları
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'full' CHECK (kind IN ('full','short','native','common')),
  UNIQUE (player_id, normalized_alias)
);

CREATE TABLE external_ids (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('country','competition','club','player','manager','staff')),
  entity_id INTEGER NOT NULL,
  source_id INTEGER NOT NULL REFERENCES data_sources(id),
  external_id TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE (entity_type, source_id, external_id),
  UNIQUE (entity_type, source_id, entity_id)
);

CREATE TABLE club_squads (
  id INTEGER PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season_id INTEGER REFERENCES seasons(id) ON DELETE SET NULL,
  squad_type TEXT NOT NULL DEFAULT 'first_team' CHECK (squad_type IN ('first_team','reserve','youth')),
  shirt_number INTEGER CHECK (shirt_number IS NULL OR shirt_number BETWEEN 0 AND 99),
  status TEXT NOT NULL CHECK (status IN ('active','on_loan_out','inactive')),
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'provider_reported' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  confidence REAL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  last_checked_at TEXT,
  CHECK (valid_to IS NULL OR valid_to >= valid_from)
);
-- Bir oyuncunun aynı anda yalnızca bir "aktif" kadro kaydı olabilir (kiralıkta ikinci kulüp için de geçerli).
CREATE UNIQUE INDEX ux_squad_one_open_active ON club_squads(player_id) WHERE status = 'active' AND valid_to IS NULL;
CREATE UNIQUE INDEX ux_squad_one_open_loanout ON club_squads(club_id, player_id) WHERE status = 'on_loan_out' AND valid_to IS NULL;
CREATE INDEX ix_squad_club ON club_squads(club_id, status, valid_from);
-- Tarih aralığı çakışması (geçmiş kayıtlar dahil) aynı oyuncu için iki aktif kadro kaydını engeller.
CREATE TRIGGER trg_squad_no_overlap_ins BEFORE INSERT ON club_squads
WHEN NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'oyuncu aynı anda iki aktif kadroda olamaz')
  WHERE EXISTS (
    SELECT 1 FROM club_squads o
    WHERE o.player_id = NEW.player_id AND o.status = 'active'
      AND NEW.valid_from < COALESCE(o.valid_to, '9999-12-31')
      AND COALESCE(NEW.valid_to, '9999-12-31') > o.valid_from
  );
END;
CREATE TRIGGER trg_squad_no_overlap_upd BEFORE UPDATE OF valid_from, valid_to, status, player_id ON club_squads
WHEN NEW.status = 'active'
BEGIN
  SELECT RAISE(ABORT, 'oyuncu aynı anda iki aktif kadroda olamaz')
  WHERE EXISTS (
    SELECT 1 FROM club_squads o
    WHERE o.player_id = NEW.player_id AND o.status = 'active' AND o.id != NEW.id
      AND NEW.valid_from < COALESCE(o.valid_to, '9999-12-31')
      AND COALESCE(NEW.valid_to, '9999-12-31') > o.valid_from
  );
END;

CREATE TABLE player_contracts (               -- bonservisin sahibi kulüp
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id INTEGER REFERENCES clubs(id) ON DELETE RESTRICT,   -- serbest oyuncuda NULL
  contract_type TEXT NOT NULL CHECK (contract_type IN ('permanent','free_agent','expired')),
  start_date TEXT,
  end_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('active','future','expired','terminated')),
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'provider_reported' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  last_checked_at TEXT,
  CHECK (contract_type = 'free_agent' OR club_id IS NOT NULL)
);
CREATE UNIQUE INDEX ux_contract_one_active ON player_contracts(player_id) WHERE status = 'active';

CREATE TABLE loan_agreements (
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  parent_club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,   -- bonservis sahibi
  loan_club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,     -- şu an oynadığı kulüp
  start_date TEXT NOT NULL,
  end_date TEXT,
  option_to_buy TEXT NOT NULL DEFAULT 'unknown' CHECK (option_to_buy IN ('yes','no','unknown')),
  option_fee_text TEXT,
  obligation_to_buy TEXT NOT NULL DEFAULT 'unknown' CHECK (obligation_to_buy IN ('yes','no','unknown')),
  recall_clause TEXT NOT NULL DEFAULT 'unknown' CHECK (recall_clause IN ('yes','no','unknown')),
  wage_share_percent REAL CHECK (wage_share_percent IS NULL OR wage_share_percent BETWEEN 0 AND 100),
  status TEXT NOT NULL CHECK (status IN ('scheduled','active','ended','recalled')),
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'provider_reported' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  last_checked_at TEXT,
  CHECK (parent_club_id != loan_club_id),
  CHECK (end_date IS NULL OR end_date >= start_date),
  UNIQUE (player_id, parent_club_id, loan_club_id, start_date)
);

CREATE TABLE transfers (
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_club_id INTEGER REFERENCES clubs(id) ON DELETE RESTRICT,
  to_club_id INTEGER REFERENCES clubs(id) ON DELETE RESTRICT,
  transfer_date TEXT NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('permanent','loan','loan_return','free','contract_expiry','unknown')),
  fee_text TEXT,                           -- kaynaktaki ham metin
  is_future INTEGER NOT NULL DEFAULT 0 CHECK (is_future IN (0,1)),
  loan_agreement_id INTEGER REFERENCES loan_agreements(id) ON DELETE SET NULL,
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'provider_reported' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  last_checked_at TEXT
);
CREATE UNIQUE INDEX ux_transfers ON transfers(player_id, transfer_date, transfer_type, COALESCE(from_club_id,0), COALESCE(to_club_id,0));

CREATE TABLE player_injuries (
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  injury_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  expected_return_date TEXT,               -- TAHMİN: kesin dönüş tarihi değildir
  actual_return_date TEXT,
  matches_missed INTEGER CHECK (matches_missed IS NULL OR matches_missed >= 0),
  is_ongoing INTEGER NOT NULL DEFAULT 1 CHECK (is_ongoing IN (0,1)),
  rehab_status TEXT,
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'provider_reported' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  last_checked_at TEXT,
  UNIQUE (player_id, start_date, injury_type)
);

CREATE TABLE player_suspensions (
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  competition_id INTEGER REFERENCES competitions(id) ON DELETE SET NULL,
  organization TEXT,
  reason TEXT NOT NULL CHECK (reason IN ('red_card','second_yellow','yellow_accumulation','disciplinary','unknown')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  matches_total INTEGER CHECK (matches_total IS NULL OR matches_total >= 0),
  matches_remaining INTEGER CHECK (matches_remaining IS NULL OR matches_remaining >= 0),
  origin TEXT NOT NULL CHECK (origin IN ('imported','game_simulated')),
  source_id INTEGER REFERENCES data_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'provider_reported' CHECK (verification_status IN ('unverified','provider_reported','verified','conflict')),
  last_checked_at TEXT
);
CREATE UNIQUE INDEX ux_suspensions ON player_suspensions(player_id, COALESCE(competition_id,0), start_date, reason, origin);

CREATE TABLE discipline_rules (              -- ülke / organizasyon / turnuva başına ayrı tanımlanabilir
  id INTEGER PRIMARY KEY,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('country','organization','competition')),
  scope_key TEXT NOT NULL,
  yellow_threshold INTEGER CHECK (yellow_threshold IS NULL OR yellow_threshold > 0),   -- kaç sarıda ceza
  yellow_ban_matches INTEGER NOT NULL DEFAULT 1,
  second_yellow_ban_matches INTEGER NOT NULL DEFAULT 1,
  red_ban_matches INTEGER NOT NULL DEFAULT 1,
  reset_policy TEXT,
  notes TEXT,
  UNIQUE (scope_type, scope_key)
);

CREATE TABLE player_statistics (
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  appearances INTEGER, minutes INTEGER, goals INTEGER, assists INTEGER,
  yellow_cards INTEGER, red_cards INTEGER, second_yellow_cards INTEGER,
  source_id INTEGER REFERENCES data_sources(id),
  last_checked_at TEXT,
  UNIQUE (player_id, season_id, club_id)
);

CREATE TABLE managers (
  id INTEGER PRIMARY KEY,
  club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  birth_date TEXT,
  nationality TEXT,
  contract_start TEXT,
  contract_end TEXT,
  source_id INTEGER REFERENCES data_sources(id),
  last_checked_at TEXT,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_managers ON managers(COALESCE(club_id,0), normalized_name);

CREATE TABLE coaching_staff (
  id INTEGER PRIMARY KEY,
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  role TEXT NOT NULL,
  nationality TEXT,
  birth_date TEXT,
  source_id INTEGER REFERENCES data_sources(id),
  last_checked_at TEXT,
  UNIQUE (club_id, normalized_name, role)
);

CREATE TABLE import_jobs (
  id INTEGER PRIMARY KEY,
  source_id INTEGER REFERENCES data_sources(id),
  job_type TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running','succeeded','partial','failed')),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_created INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_unchanged INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,
  params_json TEXT
);
CREATE INDEX ix_jobs_scope ON import_jobs(job_type, scope, started_at);

CREATE TABLE import_errors (
  id INTEGER PRIMARY KEY,
  import_job_id INTEGER NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('warning','error','conflict')),
  entity_type TEXT,
  external_id TEXT,
  message TEXT NOT NULL,
  payload_excerpt TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE data_change_history (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  source_id INTEGER REFERENCES data_sources(id),
  import_job_id INTEGER REFERENCES import_jobs(id) ON DELETE SET NULL,
  changed_at TEXT NOT NULL
);
CREATE INDEX ix_history_entity ON data_change_history(entity_type, entity_id);

CREATE TABLE game_database_versions (
  id INTEGER PRIMARY KEY,
  version INTEGER NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  description TEXT,
  snapshot_path TEXT NOT NULL,
  record_counts_json TEXT,
  validation_report_json TEXT,
  is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0,1)),
  parent_version INTEGER
);
CREATE UNIQUE INDEX ux_one_current_version ON game_database_versions(is_current) WHERE is_current = 1;
