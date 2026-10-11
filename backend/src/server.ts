import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`================================================================`);
  console.log(` Heat Action Response Engine (HARE) API Server Started`);
  console.log(` Port: ${config.port} | Env: ${config.env}`);
  console.log(` Storage: ${config.storageDriver} (${config.localDataDir})`);
  console.log(` Health: http://localhost:${config.port}/api/v1/health`);
  console.log(`================================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
