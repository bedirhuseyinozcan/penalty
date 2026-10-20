import Fuse from 'fuse.js';
import { appStorage, StorageKeys } from '../storage/mmkv';
import defaultPlayersData from '../assets/data/search-index.json';

export interface ILightPlayer {
  id: string;
  name: string;
  nationality: string;
  position: string;
  club: string;
  league: string;
  age?: number;
  shirtNumber?: number;
}

class SearchEngineService {
  private fuse: Fuse<ILightPlayer> | null = null;
  private players: ILightPlayer[] = [];
  private isInitialized = false;

  public initialize(customData?: ILightPlayer[]): void {
    let rawList: ILightPlayer[];
    if (customData && customData.length > 0) {
      rawList = customData;
    } else {
      const cached = appStorage.getString(StorageKeys.SEARCH_INDEX_CACHE);
      if (cached) {
        try {
          rawList = JSON.parse(cached);
        } catch {
          rawList = defaultPlayersData as ILightPlayer[];
        }
      } else {
        rawList = defaultPlayersData as ILightPlayer[];
      }
    }

    const seen = new Set<string>();
    const uniquePlayers: ILightPlayer[] = [];
    for (const p of rawList) {
      const key = `${p.name.toLowerCase().trim()}_${(p.club || '').toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePlayers.push(p);
      }
    }
    this.players = uniquePlayers;

    this.fuse = new Fuse(this.players, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'club', weight: 0.2 },
        { name: 'nationality', weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    this.isInitialized = true;
  }

  public updateIndex(newPlayers: ILightPlayer[]): void {
    if (!newPlayers || newPlayers.length === 0) return;
    this.players = newPlayers;
    appStorage.set(StorageKeys.SEARCH_INDEX_CACHE, JSON.stringify(newPlayers));
    appStorage.set(StorageKeys.SEARCH_INDEX_TIMESTAMP, Date.now());
    this.initialize(newPlayers);
  }

  public search(query: string, leagueMode?: 'global' | 'super_lig'): ILightPlayer[] {
    if (!this.isInitialized || !this.fuse) {
      this.initialize();
    }

    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const rawResults = this.fuse!.search(trimmed, { limit: 25 }).map((res) => res.item);

    const filtered = leagueMode
      ? leagueMode === 'super_lig'
        ? rawResults.filter((p) => p.league === 'super_lig')
        : rawResults.filter((p) => p.league !== 'super_lig')
      : rawResults;

    const seenInResults = new Set<string>();
    const deduplicated: ILightPlayer[] = [];
    for (const p of filtered) {
      const key = `${p.name.toLowerCase().trim()}_${(p.club || '').toLowerCase().trim()}`;
      if (!seenInResults.has(key)) {
        seenInResults.add(key);
        deduplicated.push(p);
      }
      if (deduplicated.length >= 15) break;
    }

    return deduplicated;
  }

  public getPlayerById(id: string): ILightPlayer | undefined {
    return this.players.find((p) => p.id === id);
  }

  public getTotalPlayerCount(): number {
    return this.players.length;
  }
}

export const searchEngine = new SearchEngineService();
