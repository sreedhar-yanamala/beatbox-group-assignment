// ============================================================
// Database Connection & Helper Wrapper
// BeatBox Music Room · Group YG-CSE2E-G09
// ============================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DEFAULT_DB_PATH = path.resolve(__dirname, '../../data/beatbox.sqlite');
const dbPath = process.env.DB_PATH || DEFAULT_DB_PATH;

// Ensure target directory exists if writing to disk
if (dbPath !== ':memory:') {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    // Foreign keys must be enabled explicitly in SQLite per connection
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Error enabling PRAGMA foreign_keys:', pragmaErr.message);
      }
    });
  }
});

// Promise wrappers for async/await usage
const query = {
  // Execute a SELECT query returning all matching rows
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Execute a SELECT query returning a single row
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Execute an INSERT, UPDATE, or DELETE query
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  // Execute raw multi-statement SQL (e.g. for migrations/seeds)
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  // Close database connection
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  // Underlying db instance
  raw: db,
  dbPath
};

module.exports = query;
