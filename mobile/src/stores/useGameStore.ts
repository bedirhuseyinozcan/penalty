import { create } from 'zustand';
import { appStorage, StorageKeys } from '../storage/mmkv';

interface IGameStore {
  coins: number;
  xp: number;
  unlockedLevels: Record<string, number>;
  completedDailyDates: string[];

  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  unlockNextLevel: (gameMode: string, leagueMode: string) => void;
  getUnlockedLevel: (gameMode: string, leagueMode: string) => number;
  markDailyCompleted: (dailyKey: string) => void;
  isDailyCompleted: (dailyKey: string) => boolean;
}

const loadInitialCoins = (): number => {
  return appStorage.getNumber(StorageKeys.USER_COINS) ?? 100;
};

const loadInitialXp = (): number => {
  return appStorage.getNumber(StorageKeys.USER_XP) ?? 0;
};

const loadInitialLevels = (): Record<string, number> => {
  const data = appStorage.getString(StorageKeys.UNLOCKED_LEVELS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return {};
};

export const useGameStore = create<IGameStore>((set, get) => ({
  coins: loadInitialCoins(),
  xp: loadInitialXp(),
  unlockedLevels: loadInitialLevels(),
  completedDailyDates: [],

  addCoins: (amount: number) => {
    set((state) => {
      const next = state.coins + amount;
      appStorage.set(StorageKeys.USER_COINS, next);
      return { coins: next };
    });
  },

  spendCoins: (amount: number) => {
    const current = get().coins;
    if (current < amount) return false;

    set(() => {
      const next = current - amount;
      appStorage.set(StorageKeys.USER_COINS, next);
      return { coins: next };
    });
    return true;
  },

  addXp: (amount: number) => {
    set((state) => {
      const next = state.xp + amount;
      appStorage.set(StorageKeys.USER_XP, next);
      return { xp: next };
    });
  },

  unlockNextLevel: (gameMode: string, leagueMode: string) => {
    set((state) => {
      const key = `${gameMode}_${leagueMode}`;
      const currentLevel = state.unlockedLevels[key] ?? 1;
      const updatedLevels = {
        ...state.unlockedLevels,
        [key]: currentLevel + 1,
      };
      appStorage.set(StorageKeys.UNLOCKED_LEVELS, JSON.stringify(updatedLevels));
      return { unlockedLevels: updatedLevels };
    });
  },

  getUnlockedLevel: (gameMode: string, leagueMode: string) => {
    const key = `${gameMode}_${leagueMode}`;
    return get().unlockedLevels[key] ?? 1;
  },

  markDailyCompleted: (dailyKey: string) => {
    set((state) => {
      if (state.completedDailyDates.includes(dailyKey)) return state;
      const next = [...state.completedDailyDates, dailyKey];
      appStorage.set(`${StorageKeys.DAILY_COMPLETED_PREFIX}${dailyKey}`, true);
      return { completedDailyDates: next };
    });
  },

  isDailyCompleted: (dailyKey: string) => {
    if (get().completedDailyDates.includes(dailyKey)) return true;
    return appStorage.getBoolean(`${StorageKeys.DAILY_COMPLETED_PREFIX}${dailyKey}`) ?? false;
  },
}));
