import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { storage } from '../src/storage/localJsonDriver.js';

describe('Phase 1 Foundation: Health & Infrastructure Tests', () => {
  it('Storage driver is healthy and writable', async () => {
    const health = await storage.checkHealth();
    expect(health.status).toBe('HEALTHY');
    expect(health.writable).toBe(true);
  });

  it('Storage driver performs atomic read and write cycles', async () => {
    const testCollection = '_test_collection';
    const sampleData = [{ id: 'test_1', value: 42 }];

    await storage.writeCollection(testCollection, sampleData);
    const readBack = await storage.readCollection<{ id: string; value: number }>(testCollection);

    expect(readBack).toHaveLength(1);
    expect(readBack[0].value).toBe(42);

    // Append test
    await storage.append(testCollection, { id: 'test_2', value: 99 });
    const updated = await storage.readCollection(testCollection);
    expect(updated).toHaveLength(2);
  });

  it('Express App instantiates cleanly with middleware', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});
