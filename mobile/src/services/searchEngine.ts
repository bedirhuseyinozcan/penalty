import Fuse from 'fuse.js';
import { appStorage, StorageKeys } from '../storage/mmkv';
import { systemApi } from '../api/systemApi';
import defaultPlayersData from '../assets/data/search-index.json';

export interface ILightPlayer {
  id: string;
  name: string;
  nationality: string;
  position: string;
  club: string;
  clubId?: string;
  league: string;
  leagues?: string[];
  age?: number;
  shirtNumber?: number;
  imageUrl?: string;
  img?: string;
  logoUrl?: string;
  logo?: string;
  clubs?: string[];
  careerPath?: Array<{
    clubName: string;
    clubLogoUrl?: string;
    startYear: number;
    endYear?: number;
    apps?: number;
    goals?: number;
  }>;
  trophies?: string[];
  isLegend?: boolean;
}

export interface IClubSearchItem {
  id: string;
  name: string;
  league: string;
  logoUrl: string;
  starPlayer: string;
  playerCount: number;
}

function normalizeClubName(str: string): string {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
export interface IPlayerPoolOptions {
  includeLegends?: boolean;
}

class SearchEngineService {
  private fuse: Fuse<ILightPlayer> | null = null;
  private activeFuse: Fuse<ILightPlayer> | null = null;
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
      const bundledList = defaultPlayersData as ILightPlayer[];
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            Array.isArray(parsed) &&
            parsed.length >= bundledList.length &&
            parsed.some((p: ILightPlayer) => p.isLegend && Array.isArray(p.leagues))
          ) {
            rawList = parsed;
          } else {
            rawList = bundledList;
          }
        } catch {
          rawList = bundledList;
        }
      } else {
        rawList = bundledList;
      }
    }

    const seen = new Set<string>();
    const uniquePlayers: ILightPlayer[] = [];
    const clubMap = new Map<string, IClubSearchItem>();

    for (const p of rawList) {
      const key =
        p.isLegend && p.id
          ? p.id
          : `${p.name.toLowerCase().trim()}_${(p.club || '').toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePlayers.push(p);
      }

      const clubName = (p.club || '').trim();
      if (clubName) {
        const clubKey = clubName.toLowerCase();
        if (!clubMap.has(clubKey)) {
          const rawId = p.clubId || '36';
          const cleanId = String(rawId).replace(/^club_/, '');
          const crestUrl =
            p.logoUrl ||
            p.logo ||
            `https://tmssl.akamaized.net/images/wappen/head/${cleanId}.png`;

          clubMap.set(clubKey, {
            id: cleanId,
            name: clubName,
            league: p.league,
            logoUrl: crestUrl,
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

    const playerFuseOptions = {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'club', weight: 0.2 },
        { name: 'nationality', weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    };
    this.fuse = new Fuse(this.players, playerFuseOptions);
    this.activeFuse = new Fuse(
      this.players.filter((p) => !p.isLegend),
      playerFuseOptions
    );

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

  public async syncSearchIndexIfNeeded(): Promise<boolean> {
    try {
      const lastSync = appStorage.getNumber(StorageKeys.SEARCH_INDEX_TIMESTAMP) ?? 0;
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - lastSync < oneDayMs && this.players.length > 0) {
        return false;
      }
      const remotePlayers = await systemApi.getSearchIndex();
      if (Array.isArray(remotePlayers) && remotePlayers.length > 0) {
        this.updateIndex(remotePlayers);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private matchesLeagueMode(p: ILightPlayer, leagueMode: 'global' | 'super_lig'): boolean {
    if (leagueMode === 'super_lig') {
      return (
        p.league === 'super_lig' ||
        (Array.isArray(p.leagues) && p.leagues.includes('super_lig'))
      );
    }
    return (
      p.league !== 'super_lig' ||
      Boolean(p.isLegend) ||
      (Array.isArray(p.leagues) && p.leagues.some((lg) => lg !== 'super_lig'))
    );
  }

  public search(
    query: string,
    leagueMode?: 'global' | 'super_lig',
    options: IPlayerPoolOptions = {}
  ): ILightPlayer[] {
    if (!this.isInitialized || !this.fuse || !this.activeFuse) {
      this.initialize();
    }

    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const engine = options.includeLegends ? this.fuse! : this.activeFuse!;
    const rawResults = engine.search(trimmed, { limit: 40 }).map((res) => res.item);

    const filtered = leagueMode
      ? rawResults.filter((p) => this.matchesLeagueMode(p, leagueMode))
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

  public getClubByNameStrict(name?: string): IClubSearchItem | undefined {
    if (!this.isInitialized) this.initialize();
    if (!name) return undefined;
    const norm = normalizeClubName(name);
    return this.clubs.find((c) => normalizeClubName(c.name) === norm);
  }

  public getClubByName(name?: string): IClubSearchItem | undefined {
    const strict = this.getClubByNameStrict(name);
    if (strict) return strict;
    if (!name) return undefined;

    const norm = normalizeClubName(name);
    const AMBIGUOUS_PREFIXES = new Set(['inter', 'barcelona', 'atletico', 'sporting', 'real', 'milan', 'united', 'city']);
    if (AMBIGUOUS_PREFIXES.has(norm)) return undefined;

    return this.clubs.find((c) => {
      const cNorm = normalizeClubName(c.name);
      if (AMBIGUOUS_PREFIXES.has(cNorm)) return false;
      return cNorm.includes(norm) || norm.includes(cNorm);
    });
  }

  public getClubLogo(clubName?: string): string | undefined {
    if (!clubName) return undefined;
    const direct = this.getClubByName(clubName);
    if (direct?.logoUrl) return direct.logoUrl;

    const norm = normalizeClubName(clubName);
    const playerMatch = this.players.find(
      (p) => normalizeClubName(p.club || '') === norm && (p.logoUrl || p.logo)
    );
    if (playerMatch?.logoUrl || playerMatch?.logo) {
      return playerMatch.logoUrl || playerMatch.logo;
    }

    return undefined;
  }

  public getPlayersByLeagueMode(
    leagueMode?: 'global' | 'super_lig',
    options: IPlayerPoolOptions = {}
  ): ILightPlayer[] {
    if (!this.isInitialized) this.initialize();
    const base = options.includeLegends
      ? this.players
      : this.players.filter((p) => !p.isLegend);
    if (!leagueMode) return base;
    return base.filter((p) => this.matchesLeagueMode(p, leagueMode));
  }

  public getPlayerById(id?: string): ILightPlayer | undefined {
    if (!this.isInitialized) this.initialize();
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    const withoutPrefix = cleanId.replace(/^tmid_/, '');
    return this.players.find((p) => {
      const pClean = p.id.trim().toLowerCase();
      return pClean === cleanId || pClean.replace(/^tmid_/, '') === withoutPrefix;
    });
  }

  public getPlayerByName(name?: string): ILightPlayer | undefined {
    if (!this.isInitialized) this.initialize();
    if (!name) return undefined;
    const lower = name.trim().toLowerCase();
    const exact = this.players.find((p) => p.name.trim().toLowerCase() === lower);
    if (exact) return exact;

    const norm = normalizeClubName(name);
    const normMatch = this.players.find((p) => normalizeClubName(p.name) === norm);
    if (normMatch) return normMatch;

    return this.players.find((p) => {
      const pNorm = normalizeClubName(p.name);
      return pNorm.includes(norm) || norm.includes(pNorm);
    });
  }

  public getPlayerPhoto(playerOrIdOrName?: ILightPlayer | string): string | undefined {
    if (!playerOrIdOrName) return undefined;
    if (typeof playerOrIdOrName === 'object') {
      if (playerOrIdOrName.imageUrl) return playerOrIdOrName.imageUrl;
      if (playerOrIdOrName.img) return playerOrIdOrName.img;
      const cleanId = playerOrIdOrName.id?.replace(/^tmid_/, '');
      return cleanId ? `https://img.a.transfermarkt.technology/portrait/big/${cleanId}.jpg` : undefined;
    }
    const found = this.getPlayerById(playerOrIdOrName) || this.getPlayerByName(playerOrIdOrName);
    if (found) {
      if (found.imageUrl) return found.imageUrl;
      if (found.img) return found.img;
      const cleanId = found.id?.replace(/^tmid_/, '');
      return cleanId ? `https://img.a.transfermarkt.technology/portrait/big/${cleanId}.jpg` : undefined;
    }
    const cleanId = String(playerOrIdOrName).replace(/^tmid_/, '');
    if (/^\d+$/.test(cleanId)) {
      return `https://img.a.transfermarkt.technology/portrait/big/${cleanId}.jpg`;
    }
    return undefined;
  }

  public getTotalPlayerCount(): number {
    if (!this.isInitialized) this.initialize();
    return this.players.length;
  }
}

export const searchEngine = new SearchEngineService();
