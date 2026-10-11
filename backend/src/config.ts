import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

function findRepoRoot(startDir: string): string {
  let cur = startDir;
  while (cur !== path.dirname(cur)) {
    const pkgPath = path.join(cur, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.name === 'heat-action-response-engine') {
          return cur;
        }
      } catch {
        // Continue searching
      }
    }
    cur = path.dirname(cur);
  }
  return startDir;
}

const repoRoot = findRepoRoot(process.cwd());

// Load .env from repository root
dotenv.config({ path: path.join(repoRoot, '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'debug',

  // Storage
  storageDriver: process.env.STORAGE_DRIVER || 'local_json',
  localDataDir: process.env.LOCAL_DATA_DIR
    ? path.resolve(repoRoot, process.env.LOCAL_DATA_DIR)
    : path.join(repoRoot, 'data'),

  // Auth
  jwtSecret: process.env.JWT_SECRET || 'hare-dev-secret-key-change-in-prod-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // AI Inference (NVIDIA NIM)
  aiProvider: process.env.AI_PROVIDER || 'nvidia',
  nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
  nvidiaBaseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  nvidiaModel: process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct',

  // Weather (Open-Meteo)
  weatherProvider: process.env.WEATHER_PROVIDER || 'open-meteo',
  weatherBaseUrl: process.env.WEATHER_BASE_URL || 'https://api.open-meteo.com/v1/forecast',
};
