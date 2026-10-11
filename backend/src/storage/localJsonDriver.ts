import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

/**
 * Local JSON Storage Driver
 * Provides atomic file-based persistence for local development and offline judging.
 */
export class LocalJsonDriver {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || config.localDataDir;
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getFilePath(collectionName: string): string {
    return path.join(this.baseDir, `${collectionName}.json`);
  }

  /**
   * Reads an entire collection from disk.
   * If file does not exist, returns empty array.
   */
  public async readCollection<T>(collectionName: string): Promise<T[]> {
    const filePath = this.getFilePath(collectionName);
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      if (!raw.trim()) {
        return [];
      }
      return JSON.parse(raw) as T[];
    } catch (error) {
      console.error(`[LocalJsonDriver] Failed reading ${collectionName}:`, error);
      throw new Error(`STORAGE_READ_ERROR: Could not read collection '${collectionName}'`);
    }
  }

  /**
   * Writes an entire collection to disk atomically using temporary file + rename with retry.
   */
  public async writeCollection<T>(collectionName: string, items: T[]): Promise<void> {
    const filePath = this.getFilePath(collectionName);
    const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;

    this.ensureDirectoryExists(this.baseDir);
    const json = JSON.stringify(items, null, 2);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        await fs.promises.writeFile(tempPath, json, 'utf-8');
        await fs.promises.rename(tempPath, filePath);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error(`[LocalJsonDriver] Failed writing ${collectionName} after ${maxAttempts} attempts:`, error);
          if (fs.existsSync(tempPath)) {
            try {
              await fs.promises.unlink(tempPath);
            } catch {
              // Ignore cleanup failure
            }
          }
          throw new Error(`STORAGE_WRITE_ERROR: Could not persist collection '${collectionName}'`);
        }
        // Exponential backoff for Windows file locks
        await new Promise((resolve) => setTimeout(resolve, 50 * attempts));
      }
    }
  }

  /**
   * Appends a single item to an existing collection.
   */
  public async append<T>(collectionName: string, item: T): Promise<T> {
    const items = await this.readCollection<T>(collectionName);
    items.push(item);
    await this.writeCollection(collectionName, items);
    return item;
  }

  /**
   * Checks driver health and write accessibility.
   */
  public async checkHealth(): Promise<{ status: string; path: string; writable: boolean }> {
    try {
      this.ensureDirectoryExists(this.baseDir);
      const testFile = path.join(this.baseDir, '.health_check');
      await fs.promises.writeFile(testFile, 'OK', 'utf-8');
      await fs.promises.unlink(testFile);
      return { status: 'HEALTHY', path: this.baseDir, writable: true };
    } catch (error) {
      return { status: 'DEGRADED', path: this.baseDir, writable: false };
    }
  }
}

export const storage = new LocalJsonDriver();
