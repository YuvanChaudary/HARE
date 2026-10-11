import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './app.js';
import fs from 'fs';
import path from 'path';

// Seed Lambda /tmp/data directory from packaged data files on cold start
const tmpDataDir = process.env.LOCAL_DATA_DIR || '/tmp/data';
if (!fs.existsSync(tmpDataDir)) {
  fs.mkdirSync(tmpDataDir, { recursive: true });
}

// Find packaged data directory if present and seed initial JSON datasets
const possibleDataDirs = [
  path.join(process.cwd(), 'data'),
  path.join(path.resolve('.'), 'data'),
  path.join(process.cwd(), 'backend', 'data'),
];

for (const dir of possibleDataDirs) {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const target = path.join(tmpDataDir, file);
          if (!fs.existsSync(target)) {
            fs.copyFileSync(path.join(dir, file), target);
          }
        }
      }
    } catch (err) {
      console.warn('Failed seeding /tmp/data from', dir, err);
    }
    break;
  }
}

const app = createApp();

let serverlessExpressInstance: any;

function asyncTask(event: any, context: any) {
  if (!serverlessExpressInstance) {
    serverlessExpressInstance = (serverlessExpress as any).default 
      ? (serverlessExpress as any).default({ app })
      : (serverlessExpress as any)({ app });
  }
  return serverlessExpressInstance(event, context);
}

export const handler = async (event: any, context: any) => {
  return asyncTask(event, context);
};
