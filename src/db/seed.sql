-- ============================================================
-- BeatBox Music Room - Seed Data
-- ============================================================

-- Clear existing data if re-seeding
DELETE FROM loans;
DELETE FROM instruments;
DELETE FROM musicians;

-- Reset autoincrement counters
DELETE FROM sqlite_sequence WHERE name IN ('musicians', 'instruments', 'loans');

-- Seed Musicians
INSERT INTO musicians (name, email) VALUES
    ('Alice Walker', 'alice.walker@beatbox.edu'),
    ('Brian May', 'brian.may@beatbox.edu'),
    ('Clara Schumann', 'clara.schumann@beatbox.edu'),
    ('Dave Grohl', 'dave.grohl@beatbox.edu'),
    ('Evelyn Glennie', 'evelyn.glennie@beatbox.edu');

-- Seed Instruments (Valid families: String, Percussion, Wind)
INSERT INTO instruments (name, family) VALUES
    ('Fender Stratocaster Guitar', 'String'),
    ('Yamaha Acoustic Cello', 'String'),
    ('Stradivarius Violin', 'String'),
    ('Pearl Snare Drum', 'Percussion'),
    ('Roland Electronic Drum Kit', 'Percussion'),
    ('Ludwig Bass Drum', 'Percussion'),
    ('Yamaha Silver Flute', 'Wind'),
    ('Bach Stradivarius Trumpet', 'Wind'),
    ('Selmer Alto Saxophone', 'Wind');

-- Seed Loans (Join records)
-- Active loans: Strings and drums currently borrowed (problem stated in brief!)
INSERT INTO loans (musician_id, instrument_id, loan_date, return_date, status) VALUES
    (1, 3, '2026-11-01', NULL, 'active'),       -- Alice Walker borrowed Stradivarius Violin (String)
    (4, 4, '2026-11-03', NULL, 'active'),       -- Dave Grohl borrowed Pearl Snare Drum (Percussion)
    (2, 1, '2026-10-15', '2026-10-25', 'returned'), -- Brian May borrowed & returned Fender Stratocaster
    (3, 7, '2026-11-05', NULL, 'active');       -- Clara Schumann borrowed Yamaha Silver Flute (Wind)
