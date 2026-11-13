// ============================================================
// Server Entry Point
// BeatBox Music Room · Group YG-CSE2E-G09
// Part 1: Server and routes
// ============================================================

const app = require('./src/app');
const { initDatabase } = require('./src/db/initDb');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Ensure database tables and initial seed data exist
    await initDatabase({ seed: true, force: false });

    const server = app.listen(PORT, () => {
      console.log('===========================================================');
      console.log('  🎵 BeatBox Music Room API');
      console.log('  Group: YG-CSE2E-G09 | Theme 9: Instrument loans');
      console.log(`  Server running at: http://localhost:${PORT}`);
      console.log('===========================================================');
      console.log(`  - API Root:           http://localhost:${PORT}/`);
      console.log(`  - Instruments:        http://localhost:${PORT}/instruments`);
      console.log(`  - Search by Family:   http://localhost:${PORT}/instruments?family=String`);
      console.log(`  - Musicians:          http://localhost:${PORT}/musicians`);
      console.log(`  - Join Endpoint:      http://localhost:${PORT}/loans`);
      console.log('===========================================================');
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
