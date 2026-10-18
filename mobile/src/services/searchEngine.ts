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
    if (customData && customData.length > 0) {
      this.players = customData;
    } else {
      const cached = appStorage.getString(StorageKeys.SEARCH_INDEX_CACHE);
      if (cached) {
        try {
          this.players = JSON.parse(cached);
        } catch {
          this.players = defaultPlayersData as ILightPlayer[];
        }
      } else {
        this.players = defaultPlayersData as ILightPlayer[];
      }
    }

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

    const results = this.fuse!.search(trimmed, { limit: 15 }).map((res) => res.item);

    if (!leagueMode) return results;

    if (leagueMode === 'super_lig') {
      return results.filter((p) => p.league === 'super_lig');
    }

    return results.filter((p) => p.league !== 'super_lig');
  }

  public getPlayerById(id: string): ILightPlayer | undefined {
    return this.players.find((p) => p.id === id);
  }

  public getTotalPlayerCount(): number {
    return this.players.length;
  }
}

export const searchEngine = new SearchEngineService();
