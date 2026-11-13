// ============================================================
// Database Initializer & Seeder
// BeatBox Music Room · Group YG-CSE2E-G09
// ============================================================

const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const schemaPath = path.resolve(__dirname, 'schema.sql');
const seedPath = path.resolve(__dirname, 'seed.sql');

async function initDatabase({ seed = true, force = false } = {}) {
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schemaSql);

    // Check if we need to seed
    if (seed) {
      const musiciansCount = await db.get('SELECT COUNT(*) as count FROM musicians');
      if (force || musiciansCount.count === 0) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await db.exec(seedSql);
      }
    }
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// If executed directly from command line (e.g. `npm run init-db`)
if (require.main === module) {
  initDatabase({ seed: true, force: true })
    .then(() => {
      console.log('Database initialized and seeded successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
