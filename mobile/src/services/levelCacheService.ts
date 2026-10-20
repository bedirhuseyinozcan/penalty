import { appStorage, StorageKeys } from '../storage/mmkv';
import { ILevelData, levelApi } from '../api/levelApi';
import { GameModeType } from '../api/dailyApi';
import { searchEngine } from './searchEngine';

const LOCAL_SEED_PACK: Record<string, Record<number, ILevelData>> = {
  whoAreYa_super_lig: {
    1: {
      levelNumber: 1,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_401923',
      playerName: 'Victor Osimhen',
      playerClub: 'Galatasaray',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/401923-1671105169.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Nijeryalı golcü, Serie A şampiyonluğu yaşadı'],
    },
    2: {
      levelNumber: 2,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_382528',
      playerName: 'Kerem Aktürkoğlu',
      playerClub: 'Fenerbahçe',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/382528-1791386984.jpg',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Milli sol kanat, Portekiz tecrübesi var'],
    },
    3: {
      levelNumber: 3,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_68863',
      playerName: 'Mauro Icardi',
      playerClub: 'Galatasaray',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/68863-1671105169.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Arjantinli santrafor, Serie A ve Ligue 1 tecrübeli'],
    },
  },
  whoAreYa_global: {
    1: {
      levelNumber: 1,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      targetPlayerId: 'tmid_418560',
      playerName: 'Erling Haaland',
      playerClub: 'Man City',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Norveçli gol makinesi'],
    },
    2: {
      levelNumber: 2,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      targetPlayerId: 'tmid_581678',
      playerName: 'Jude Bellingham',
      playerClub: 'Real Madrid',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/581678-1693212850.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['İngiliz süperstar orta saha'],
    },
  },
  careerPath_super_lig: {
    1: {
      levelNumber: 1,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_382528',
      playerName: 'Kerem Aktürkoğlu',
      playerClub: 'Fenerbahçe',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Erzincanspor -> Galatasaray -> Benfica -> Fenerbahçe'],
      careerPath: [
        { clubName: 'Bodrum FK', startYear: 2016, endYear: 2017, apps: 28, goals: 4 },
        { clubName: 'Karacabey Bld', startYear: 2018, endYear: 2019, apps: 35, goals: 3 },
        { clubName: 'Erzincanspor', startYear: 2019, endYear: 2020, apps: 34, goals: 20 },
        { clubName: 'Galatasaray', startYear: 2020, endYear: 2024, apps: 179, goals: 46 },
        { clubName: 'Benfica', startYear: 2024, endYear: 2025, apps: 58, goals: 17 },
        { clubName: 'Fenerbahçe', startYear: 2025, apps: 38, goals: 12 },
      ],
    },
    2: {
      levelNumber: 2,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_401923',
      playerName: 'Victor Osimhen',
      playerClub: 'Galatasaray',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Wolfsburg -> Charleroi -> Lille -> Napoli -> Galatasaray'],
      careerPath: [
        { clubName: 'Wolfsburg', startYear: 2017, endYear: 2018, apps: 16, goals: 0 },
        { clubName: 'Charleroi', startYear: 2018, endYear: 2019, apps: 36, goals: 20 },
        { clubName: 'Lille', startYear: 2019, endYear: 2020, apps: 38, goals: 18 },
        { clubName: 'Napoli', startYear: 2020, endYear: 2024, apps: 133, goals: 76 },
        { clubName: 'Galatasaray', startYear: 2024, apps: 70, goals: 56 },
      ],
    },
  },
  careerPath_global: {
    1: {
      levelNumber: 1,
      gameMode: 'careerPath',
      leagueMode: 'global',
      targetPlayerId: 'tmid_418560',
      playerName: 'Erling Haaland',
      playerClub: 'Man City',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Bryne -> Molde -> Salzburg -> Dortmund -> Man City'],
      careerPath: [
        { clubName: 'Bryne', startYear: 2015, endYear: 2017, apps: 16, goals: 0 },
        { clubName: 'Molde FK', startYear: 2017, endYear: 2019, apps: 50, goals: 20 },
        { clubName: 'Salzburg', startYear: 2019, endYear: 2020, apps: 27, goals: 29 },
        { clubName: 'Dortmund', startYear: 2020, endYear: 2022, apps: 89, goals: 86 },
        { clubName: 'Man City', startYear: 2022, apps: 191, goals: 157 },
      ],
    },
  },
};

class LevelCacheService {
  private getStorageKey(gameMode: string, leagueMode: string): string {
    return `${StorageKeys.LEVEL_CACHE_PREFIX}${gameMode}_${leagueMode}`;
  }

  private loadCacheFromStorage(gameMode: string, leagueMode: string): Record<number, ILevelData> {
    const key = this.getStorageKey(gameMode, leagueMode);
    const raw = appStorage.getString(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return {};
  }

  private saveCacheToStorage(
    gameMode: string,
    leagueMode: string,
    cache: Record<number, ILevelData>
  ): void {
    const key = this.getStorageKey(gameMode, leagueMode);
    try {
      appStorage.set(key, JSON.stringify(cache));
    } catch (e) {
      console.warn('Failed to save level cache to storage:', e);
    }
  }

  public getLevel(
    levelNumber: number,
    gameMode: GameModeType,
    leagueMode: 'global' | 'super_lig'
  ): ILevelData | null {
    const memory = this.loadCacheFromStorage(gameMode, leagueMode);
    if (memory[levelNumber]) {
      return memory[levelNumber];
    }

    const seedKey = `${gameMode}_${leagueMode}`;
    const seedGroup = LOCAL_SEED_PACK[seedKey];
    if (seedGroup && seedGroup[levelNumber]) {
      return seedGroup[levelNumber];
    }

    // Dynamic offline generator from bundled search-index.json
    if (gameMode === 'clubLogo') {
      const clubs = searchEngine.searchClubs('', leagueMode);
      if (clubs.length > 0) {
        const club = clubs[(levelNumber - 1) % clubs.length];
        return {
          levelNumber,
          gameMode,
          leagueMode,
          rewardCoins: 30,
          rewardXp: 50,
          targetPlayerId: `club_${club.id}`,
          playerName: club.starPlayer,
          playerClub: club.name,
          imageUrl: club.logoUrl,
          hints: [`Kadrodaki Yıldız: ${club.starPlayer}`],
        };
      }
    } else if (gameMode === 'contextinho' || gameMode === 'whoAreYa') {
      const players = searchEngine.getPlayersByLeagueMode(leagueMode);
      if (players.length > 0) {
        const offset = gameMode === 'contextinho' ? 13 : 0;
        const p = players[(levelNumber - 1 + offset) % Math.min(200, players.length)];
        return {
          levelNumber,
          gameMode,
          leagueMode,
          rewardCoins: 35,
          rewardXp: 60,
          targetPlayerId: p.id,
          playerName: p.name,
          playerClub: p.club,
          hints: [`${p.nationality} • ${p.position}`],
        };
      }
    }

    return null;
  }

  public cacheLevel(level: ILevelData): void {
    const memory = this.loadCacheFromStorage(level.gameMode, level.leagueMode);
    memory[level.levelNumber] = level;
    this.saveCacheToStorage(level.gameMode, level.leagueMode, memory);
  }

  public cacheLevelPack(
    gameMode: GameModeType,
    leagueMode: 'global' | 'super_lig',
    levels: ILevelData[]
  ): void {
    if (!levels || levels.length === 0) return;
    const memory = this.loadCacheFromStorage(gameMode, leagueMode);
    for (const lvl of levels) {
      memory[lvl.levelNumber] = lvl;
    }
    this.saveCacheToStorage(gameMode, leagueMode, memory);
  }

  public async syncLevelPack(
    gameMode: GameModeType,
    leagueMode: 'global' | 'super_lig',
    fromLevel = 1,
    toLevel = 20
  ): Promise<boolean> {
    try {
      const pack = await levelApi.getLevelPack(gameMode, leagueMode, fromLevel, toLevel);
      if (pack && pack.length > 0) {
        this.cacheLevelPack(gameMode, leagueMode, pack);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const levelCacheService = new LevelCacheService();
