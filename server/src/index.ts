import { createApp } from './app';
import { ENV } from './env';
import { startReportCron } from './reports/report.cron';
import { seedDatabase } from './seed';

const startServer = async () => {
  // Seed database with demo data
  await seedDatabase();
  
  // Create Express app
  const app = createApp();
  
  // Start cron jobs
  startReportCron();
  
  // Start server
  const server = app.listen(ENV.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏥  ElderCare Assist API Server                    ║
║                                                       ║
║   Server running on: http://localhost:${ENV.PORT}        ║
║   API Documentation: http://localhost:${ENV.PORT}/api/docs  ║
║   Environment: ${ENV.NODE_ENV}                           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[SERVER] Shutting down gracefully...');
    server.close(() => {
      console.log('[SERVER] Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((error) => {
  console.error('[SERVER] Failed to start:', error);
  process.exit(1);
});

