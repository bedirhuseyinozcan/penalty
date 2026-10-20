import { appStorage, StorageKeys } from '../storage/mmkv';
import { ILevelData, levelApi } from '../api/levelApi';

const LOCAL_SEED_PACK: Record<string, Record<number, ILevelData>> = {
  whoAreYa_super_lig: {
    1: {
      levelNumber: 1,
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
    2: {
      levelNumber: 2,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_28396',
      playerName: 'Edin Džeko',
      playerClub: 'Fenerbahçe',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/28396-1668502395.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Bosna Hersekli kule forvet, Premier Lig ve Serie A şampiyonu'],
    },
    3: {
      levelNumber: 3,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_24395',
      playerName: 'Dries Mertens',
      playerClub: 'Galatasaray',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/56416-1668502425.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Belçikalı hücumcu, Napoli tarihinin en golcü oyuncusu'],
    },
    4: {
      levelNumber: 4,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_19113',
      playerName: 'Fred',
      playerClub: 'Fenerbahçe',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/191614-1689255655.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Brezilyalı orta saha, Manchester United ve Shakhtar geçmişi var'],
    },
    5: {
      levelNumber: 5,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_44903',
      playerName: 'Fernando Muslera',
      playerClub: 'Galatasaray',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/44903-1671105215.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Uruguaylı efsane kaleci, 10+ yıldır Türkiye’de'],
    },
  },
  whoAreYa_global: {
    1: {
      levelNumber: 1,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      targetPlayerId: 'tmid_418560',
      playerName: 'Erling Haaland',
      playerClub: 'Manchester City',
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
    3: {
      levelNumber: 3,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      targetPlayerId: 'tmid_342229',
      playerName: 'Kylian Mbappé',
      playerClub: 'Real Madrid',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/342229-1682683695.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Fransız forvet, Dünya Kupası şampiyonu'],
    },
    4: {
      levelNumber: 4,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      targetPlayerId: 'tmid_88755',
      playerName: 'Kevin De Bruyne',
      playerClub: 'Manchester City',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/88755-1684334346.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Belçikalı pas ustası'],
    },
    5: {
      levelNumber: 5,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      targetPlayerId: 'tmid_93720',
      playerName: 'Harry Kane',
      playerClub: 'Bayern Munich',
      imageUrl: 'https://img.a.transfermarkt.technology/portrait/big/93720-1692257321.png',
      blurImages: [],
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['İngiltere kaptanı ve Bundesliga gol kralı'],
    },
  },
  careerPath_super_lig: {
    1: {
      levelNumber: 1,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_28396',
      playerName: 'Edin Džeko',
      playerClub: 'Fenerbahçe',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Wolfsburg -> Man City -> Roma -> Inter -> Fenerbahçe'],
      careerPath: [
        { clubName: 'Željezničar', startYear: 2003, endYear: 2005 },
        { clubName: 'Teplice', startYear: 2005, endYear: 2007 },
        { clubName: 'VfL Wolfsburg', startYear: 2007, endYear: 2011, apps: 142, goals: 85 },
        { clubName: 'Manchester City', startYear: 2011, endYear: 2016, apps: 189, goals: 72 },
        { clubName: 'AS Roma', startYear: 2015, endYear: 2021, apps: 260, goals: 119 },
        { clubName: 'Inter', startYear: 2021, endYear: 2023, apps: 101, goals: 31 },
        { clubName: 'Fenerbahçe', startYear: 2023 },
      ],
    },
    2: {
      levelNumber: 2,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_68863',
      playerName: 'Mauro Icardi',
      playerClub: 'Galatasaray',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Sampdoria -> Inter -> PSG -> Galatasaray'],
      careerPath: [
        { clubName: 'Barcelona (Youth)', startYear: 2008, endYear: 2011 },
        { clubName: 'Sampdoria', startYear: 2011, endYear: 2013, apps: 33, goals: 11 },
        { clubName: 'Inter', startYear: 2013, endYear: 2019, apps: 219, goals: 124 },
        { clubName: 'Paris Saint-Germain', startYear: 2019, endYear: 2022, apps: 92, goals: 38 },
        { clubName: 'Galatasaray', startYear: 2022 },
      ],
    },
    3: {
      levelNumber: 3,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_24395',
      playerName: 'Dries Mertens',
      playerClub: 'Galatasaray',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Utrecht -> PSV -> Napoli -> Galatasaray'],
      careerPath: [
        { clubName: 'Gent', startYear: 2005, endYear: 2007 },
        { clubName: 'AGOVV', startYear: 2007, endYear: 2009 },
        { clubName: 'FC Utrecht', startYear: 2009, endYear: 2011, apps: 86, goals: 21 },
        { clubName: 'PSV Eindhoven', startYear: 2011, endYear: 2013, apps: 88, goals: 45 },
        { clubName: 'SSC Napoli', startYear: 2013, endYear: 2022, apps: 397, goals: 148 },
        { clubName: 'Galatasaray', startYear: 2022 },
      ],
    },
    4: {
      levelNumber: 4,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_36182',
      playerName: 'Dušan Tadić',
      playerClub: 'Fenerbahçe',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Groningen -> Twente -> Southampton -> Ajax -> Fenerbahçe'],
      careerPath: [
        { clubName: 'Vojvodina', startYear: 2006, endYear: 2010 },
        { clubName: 'FC Groningen', startYear: 2010, endYear: 2012, apps: 76, goals: 14 },
        { clubName: 'FC Twente', startYear: 2012, endYear: 2014, apps: 85, goals: 32 },
        { clubName: 'Southampton', startYear: 2014, endYear: 2018, apps: 162, goals: 24 },
        { clubName: 'Ajax', startYear: 2018, endYear: 2023, apps: 241, goals: 105 },
        { clubName: 'Fenerbahçe', startYear: 2023 },
      ],
    },
    5: {
      levelNumber: 5,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      targetPlayerId: 'tmid_19113',
      playerName: 'Fred',
      playerClub: 'Fenerbahçe',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Internacional -> Shakhtar Donetsk -> Manchester United -> Fenerbahçe'],
      careerPath: [
        { clubName: 'Internacional', startYear: 2012, endYear: 2013 },
        { clubName: 'Shakhtar Donetsk', startYear: 2013, endYear: 2018, apps: 155, goals: 15 },
        { clubName: 'Manchester United', startYear: 2018, endYear: 2023, apps: 213, goals: 14 },
        { clubName: 'Fenerbahçe', startYear: 2023 },
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
      playerClub: 'Manchester City',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Bryne -> Molde -> Salzburg -> Dortmund -> Man City'],
      careerPath: [
        { clubName: 'Bryne FK', startYear: 2015, endYear: 2017 },
        { clubName: 'Molde', startYear: 2017, endYear: 2019, apps: 50, goals: 20 },
        { clubName: 'Red Bull Salzburg', startYear: 2019, endYear: 2020, apps: 27, goals: 29 },
        { clubName: 'Borussia Dortmund', startYear: 2020, endYear: 2022, apps: 89, goals: 86 },
        { clubName: 'Manchester City', startYear: 2022, apps: 100, goals: 90 },
      ],
    },
    2: {
      levelNumber: 2,
      gameMode: 'careerPath',
      leagueMode: 'global',
      targetPlayerId: 'tmid_581678',
      playerName: 'Jude Bellingham',
      playerClub: 'Real Madrid',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Birmingham City -> Dortmund -> Real Madrid'],
      careerPath: [
        { clubName: 'Birmingham City', startYear: 2019, endYear: 2020, apps: 44, goals: 4 },
        { clubName: 'Borussia Dortmund', startYear: 2020, endYear: 2023, apps: 132, goals: 24 },
        { clubName: 'Real Madrid', startYear: 2023, apps: 50, goals: 25 },
      ],
    },
    3: {
      levelNumber: 3,
      gameMode: 'careerPath',
      leagueMode: 'global',
      targetPlayerId: 'tmid_38253',
      playerName: 'Robert Lewandowski',
      playerClub: 'Barcelona',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Lech Poznań -> Dortmund -> Bayern Munich -> Barcelona'],
      careerPath: [
        { clubName: 'Znicz Pruszków', startYear: 2006, endYear: 2008 },
        { clubName: 'Lech Poznań', startYear: 2008, endYear: 2010, apps: 82, goals: 41 },
        { clubName: 'Borussia Dortmund', startYear: 2010, endYear: 2014, apps: 187, goals: 103 },
        { clubName: 'Bayern Munich', startYear: 2014, endYear: 2022, apps: 375, goals: 344 },
        { clubName: 'FC Barcelona', startYear: 2022, apps: 95, goals: 59 },
      ],
    },
    4: {
      levelNumber: 4,
      gameMode: 'careerPath',
      leagueMode: 'global',
      targetPlayerId: 'tmid_8198',
      playerName: 'Cristiano Ronaldo',
      playerClub: 'Al Nassr',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Sporting -> Man Utd -> Real Madrid -> Juventus -> Man Utd -> Al Nassr'],
      careerPath: [
        { clubName: 'Sporting CP', startYear: 2002, endYear: 2003, apps: 31, goals: 5 },
        { clubName: 'Manchester United', startYear: 2003, endYear: 2009, apps: 292, goals: 118 },
        { clubName: 'Real Madrid', startYear: 2009, endYear: 2018, apps: 438, goals: 450 },
        { clubName: 'Juventus', startYear: 2018, endYear: 2021, apps: 134, goals: 101 },
        { clubName: 'Manchester United', startYear: 2021, endYear: 2022, apps: 54, goals: 27 },
        { clubName: 'Al Nassr', startYear: 2023 },
      ],
    },
    5: {
      levelNumber: 5,
      gameMode: 'careerPath',
      leagueMode: 'global',
      targetPlayerId: 'tmid_28003',
      playerName: 'Lionel Messi',
      playerClub: 'Inter Miami',
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Barcelona -> PSG -> Inter Miami'],
      careerPath: [
        { clubName: 'Barcelona C/B', startYear: 2003, endYear: 2005 },
        { clubName: 'FC Barcelona', startYear: 2004, endYear: 2021, apps: 778, goals: 672 },
        { clubName: 'Paris Saint-Germain', startYear: 2021, endYear: 2023, apps: 75, goals: 32 },
        { clubName: 'Inter Miami', startYear: 2023 },
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
    gameMode: 'whoAreYa' | 'careerPath',
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

    return null;
  }

  public cacheLevel(level: ILevelData): void {
    const memory = this.loadCacheFromStorage(level.gameMode, level.leagueMode);
    memory[level.levelNumber] = level;
    this.saveCacheToStorage(level.gameMode, level.leagueMode, memory);
  }

  public cacheLevelPack(
    gameMode: 'whoAreYa' | 'careerPath',
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
    gameMode: 'whoAreYa' | 'careerPath',
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
