import Fuse from 'fuse.js';
import { appStorage, StorageKeys } from '../storage/mmkv';
import defaultPlayersData from '../assets/data/search-index.json';

export interface ILightPlayer {
  id: string;
  name: string;
  nationality: string;
  position: string;
  club: string;
  clubId?: string;
  league: string;
  age?: number;
  shirtNumber?: number;
}

export interface IClubSearchItem {
  id: string;
  name: string;
  league: string;
  logoUrl: string;
  starPlayer: string;
  playerCount: number;
}

class SearchEngineService {
  private fuse: Fuse<ILightPlayer> | null = null;
  private clubFuse: Fuse<IClubSearchItem> | null = null;
  private players: ILightPlayer[] = [];
  private clubs: IClubSearchItem[] = [];
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
    const clubMap = new Map<string, IClubSearchItem>();

    for (const p of rawList) {
      const key = `${p.name.toLowerCase().trim()}_${(p.club || '').toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePlayers.push(p);
      }

      const clubName = (p.club || '').trim();
      if (clubName) {
        const clubKey = clubName.toLowerCase();
        if (!clubMap.has(clubKey)) {
          const cid = p.clubId || '36';
          clubMap.set(clubKey, {
            id: cid,
            name: clubName,
            league: p.league,
            logoUrl: `https://tmssl.akamaized.net/images/wappen/head/${cid}.png`,
            starPlayer: p.name,
            playerCount: 1,
          });
        } else {
          clubMap.get(clubKey)!.playerCount += 1;
        }
      }
    }

    this.players = uniquePlayers;
    this.clubs = Array.from(clubMap.values());

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

    this.clubFuse = new Fuse(this.clubs, {
      keys: [{ name: 'name', weight: 0.85 }, { name: 'starPlayer', weight: 0.15 }],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 1,
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

  public searchClubs(query: string, leagueMode?: 'global' | 'super_lig'): IClubSearchItem[] {
    if (!this.isInitialized || !this.clubFuse) {
      this.initialize();
    }

    const trimmed = query.trim();
    const basePool = leagueMode
      ? leagueMode === 'super_lig'
        ? this.clubs.filter((c) => c.league === 'super_lig')
        : this.clubs.filter((c) => c.league !== 'super_lig')
      : this.clubs;

    if (!trimmed) {
      return basePool.slice(0, 20);
    }

    const rawResults = this.clubFuse!.search(trimmed, { limit: 25 }).map((res) => res.item);
    const filtered = leagueMode
      ? leagueMode === 'super_lig'
        ? rawResults.filter((c) => c.league === 'super_lig')
        : rawResults.filter((c) => c.league !== 'super_lig')
      : rawResults;

    return filtered.slice(0, 15);
  }

  public getClubByName(name?: string): IClubSearchItem | undefined {
    if (!this.isInitialized) this.initialize();
    if (!name) return undefined;
    const lower = name.toLowerCase().trim();
    return this.clubs.find(
      (c) => c.name.toLowerCase() === lower || c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
    );
  }

  public getPlayersByLeagueMode(leagueMode?: 'global' | 'super_lig'): ILightPlayer[] {
    if (!this.isInitialized) this.initialize();
    if (!leagueMode) return this.players;
    return leagueMode === 'super_lig'
      ? this.players.filter((p) => p.league === 'super_lig')
      : this.players.filter((p) => p.league !== 'super_lig');
  }

  public getPlayerById(id: string): ILightPlayer | undefined {
    if (!this.isInitialized) this.initialize();
    return this.players.find((p) => p.id === id);
  }

  public getTotalPlayerCount(): number {
    if (!this.isInitialized) this.initialize();
    return this.players.length;
  }
}

export const searchEngine = new SearchEngineService();
