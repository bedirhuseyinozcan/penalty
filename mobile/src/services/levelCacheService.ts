import { appStorage, StorageKeys } from '../storage/mmkv';
import { ILevelData, levelApi } from '../api/levelApi';
import { GameModeType } from '../api/dailyApi';
import { searchEngine } from './searchEngine';

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
          initialBlurImageUrl: club.logoUrl,
          hints: [`Kadrodaki Yıldız: ${club.starPlayer}`],
        };
      }
    } else if (
      gameMode === 'whoAreYa' ||
      gameMode === 'contextinho' ||
      gameMode === 'careerPath'
    ) {
      const players = searchEngine.getPlayersByLeagueMode(leagueMode);
      if (players.length > 0) {
        const offset =
          gameMode === 'contextinho' ? 17 : gameMode === 'careerPath' ? 7 : 0;
        const poolSize = Math.min(250, players.length);
        const p = players[(levelNumber - 1 + offset) % poolSize];

        const careerSteps =
          p.careerPath && p.careerPath.length > 0
            ? p.careerPath
            : p.clubs && p.clubs.length > 0
            ? p.clubs.map((cName, idx) => ({
                clubName: cName,
                startYear: 2018 + idx * 2,
                ...(idx < p.clubs!.length - 1 ? { endYear: 2020 + idx * 2 } : {}),
              }))
            : [{ clubName: p.club, startYear: 2025 }];

        const pImg =
          p.imageUrl ||
          p.img ||
          (p.id ? `https://img.a.transfermarkt.technology/portrait/big/${p.id.replace(/^tmid_/, '')}.jpg` : undefined);

        return {
          levelNumber,
          gameMode,
          leagueMode,
          rewardCoins: gameMode === 'whoAreYa' ? 30 : 35,
          rewardXp: gameMode === 'whoAreYa' ? 50 : 60,
          targetPlayerId: p.id,
          playerName: p.name,
          playerClub: p.club,
          imageUrl: pImg,
          initialBlurImageUrl: pImg,
          blurImages: [],
          careerPath: careerSteps,
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
