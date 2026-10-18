import { createApp } from './app';
import { connectDatabase } from './config/db';
import { ENV } from './config/env';

const startServer = async () => {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(ENV.PORT, () => {
    console.log(`🚀 Penalty Hub Backend running in [${ENV.NODE_ENV}] mode on port ${ENV.PORT}`);
    console.log(`📡 Health Check: http://localhost:${ENV.PORT}/api/v1/system/health`);
    console.log(`⏰ Anti-Cheat Server Time: http://localhost:${ENV.PORT}/api/v1/system/time`);
  });

  const shutdown = () => {
    console.log('🛑 Shutting down server gracefully...');
    server.close(() => {
      console.log('🔒 Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
