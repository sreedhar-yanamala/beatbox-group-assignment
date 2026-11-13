-- ============================================================
-- BeatBox Music Room - SQLite Schema
-- BDF Group Assignment · Theme 9: Instrument loans
-- Group: YG-CSE2E-G09
-- ============================================================

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- 1. Musicians Table
CREATE TABLE IF NOT EXISTS musicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Instruments Table
-- Twist Rule: Instrument family must be 'String', 'Percussion', or 'Wind'
CREATE TABLE IF NOT EXISTS instruments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    family TEXT NOT NULL CHECK(family IN ('String', 'Percussion', 'Wind')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Loans Table (Relational Join Table linking musicians and instruments)
CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    musician_id INTEGER NOT NULL,
    instrument_id INTEGER NOT NULL,
    loan_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'returned')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (musician_id) REFERENCES musicians(id) ON DELETE CASCADE,
    FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON DELETE CASCADE
);

-- Indexes for fast searching and joining
CREATE INDEX IF NOT EXISTS idx_instruments_family ON instruments(family);
CREATE INDEX IF NOT EXISTS idx_loans_musician_id ON loans(musician_id);
CREATE INDEX IF NOT EXISTS idx_loans_instrument_id ON loans(instrument_id);
