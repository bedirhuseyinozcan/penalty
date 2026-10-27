import fs from 'fs';
import path from 'path';

const SEARCH_INDEX_PATH = path.resolve(__dirname, '../../data/search-index.json');

export class PlayerService {
  private cache: { mtimeMs: number; items: unknown[] } | null = null;
  public async getSearchIndex(): Promise<unknown[]> {
    try {
      const { mtimeMs } = await fs.promises.stat(SEARCH_INDEX_PATH);
      if (this.cache && this.cache.mtimeMs === mtimeMs) {
        return this.cache.items;
      }
      const items = JSON.parse(await fs.promises.readFile(SEARCH_INDEX_PATH, 'utf8'));
      this.cache = { mtimeMs, items: Array.isArray(items) ? items : [] };
      return this.cache.items;
    } catch (err) {
      console.warn('Could not load search-index.json; run "npm run pipeline:export-search":', err);
      return [];
    }
  }
}

export const playerService = new PlayerService();
