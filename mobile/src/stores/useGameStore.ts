import { create } from 'zustand';
import { appStorage, StorageKeys } from '../storage/mmkv';
import { getAuthoritativeUtcDate } from '../services/authoritativeTime';

export interface IGameStats {
  gamesPlayed: number;
  gamesWon: number;
  guessDistribution: Record<number, number>;
}

interface IGameStore {
  coins: number;
  xp: number;
  unlockedLevels: Record<string, number>;
  completedDailyDates: string[];
  currentStreak: number;
  maxStreak: number;
  lastCompletedDate: string | null;
  gamesPlayed: number;
  gamesWon: number;
  guessDistribution: Record<number, number>;
  unlockedCosmetics: string[];
  equippedCosmeticId: string;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  unlockNextLevel: (gameMode: string, leagueMode: string) => void;
  getUnlockedLevel: (gameMode: string, leagueMode: string) => number;
  markDailyCompleted: (
    dailyKey: string,
    isWon?: boolean,
    dateStr?: string
  ) => { streakBonusCoins: number; newStreak: number };
  clearDailyCompleted: (dailyKey: string) => void;
  isDailyCompleted: (dailyKey: string) => boolean;
  recordGameResult: (isWon: boolean, attemptsUsed: number) => void;
  unlockCosmetic: (id: string, cost: number) => boolean;
  equipCosmetic: (id: string) => void;
  isCosmeticUnlocked: (id: string) => boolean;
  hydrateFromStorage: () => void;
}

const loadInitialCoins = (): number => {
  return appStorage.getNumber(StorageKeys.USER_COINS) ?? 100;
};

const loadInitialXp = (): number => {
  return appStorage.getNumber(StorageKeys.USER_XP) ?? 0;
};

const loadInitialUnlockedCosmetics = (): string[] => {
  const data = appStorage.getString(StorageKeys.UNLOCKED_COSMETICS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return ['avatar_default'];
};

const loadInitialEquippedCosmetic = (): string => {
  return appStorage.getString(StorageKeys.EQUIPPED_COSMETIC_ID) || 'avatar_default';
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

const loadInitialStats = (): IGameStats => {
  const data = appStorage.getString(StorageKeys.GAME_STATS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {}
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
};

const initialStats = loadInitialStats();

export const useGameStore = create<IGameStore>((set, get) => ({
  coins: loadInitialCoins(),
  xp: loadInitialXp(),
  unlockedLevels: loadInitialLevels(),
  completedDailyDates: [],
  currentStreak: appStorage.getNumber(StorageKeys.CURRENT_STREAK) ?? 0,
  maxStreak: appStorage.getNumber(StorageKeys.MAX_STREAK) ?? 0,
  lastCompletedDate: appStorage.getString(StorageKeys.LAST_COMPLETED_DATE) ?? null,
  gamesPlayed: initialStats.gamesPlayed,
  gamesWon: initialStats.gamesWon,
  guessDistribution: initialStats.guessDistribution,
  unlockedCosmetics: loadInitialUnlockedCosmetics(),
  equippedCosmeticId: loadInitialEquippedCosmetic(),

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

  markDailyCompleted: (dailyKey: string, isWon: boolean = true, dateStr?: string) => {
    const today = dateStr || getAuthoritativeUtcDate();
    const state = get();
    let streakBonusCoins = 0;
    let newStreak = state.currentStreak;

    if (!state.completedDailyDates.includes(dailyKey)) {
      appStorage.set(`${StorageKeys.DAILY_COMPLETED_PREFIX}${dailyKey}`, true);
    }

    if (!isWon) {
      newStreak = 0;
      appStorage.set(StorageKeys.CURRENT_STREAK, 0);
      appStorage.set(StorageKeys.LAST_COMPLETED_DATE, today);

      set((s) => ({
        completedDailyDates: s.completedDailyDates.includes(dailyKey)
          ? s.completedDailyDates
          : [...s.completedDailyDates, dailyKey],
        currentStreak: 0,
        lastCompletedDate: today,
      }));

      return { streakBonusCoins: 0, newStreak: 0 };
    }

    if (state.lastCompletedDate !== today) {
      if (!state.lastCompletedDate) {
        newStreak = 1;
      } else {
        const lastDate = new Date(state.lastCompletedDate);
        const currDate = new Date(today);
        const diffTime = currDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

        if (diffDays === 1) {
          newStreak = state.currentStreak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      if (newStreak === 3) streakBonusCoins = 50;
      else if (newStreak === 7) streakBonusCoins = 150;
      else if (newStreak > 7 && newStreak % 7 === 0) streakBonusCoins = 250;

      const newMax = Math.max(state.maxStreak, newStreak);

      appStorage.set(StorageKeys.CURRENT_STREAK, newStreak);
      appStorage.set(StorageKeys.MAX_STREAK, newMax);
      appStorage.set(StorageKeys.LAST_COMPLETED_DATE, today);

      if (streakBonusCoins > 0) {
        state.addCoins(streakBonusCoins);
      }

      set((s) => ({
        completedDailyDates: s.completedDailyDates.includes(dailyKey)
          ? s.completedDailyDates
          : [...s.completedDailyDates, dailyKey],
        currentStreak: newStreak,
        maxStreak: newMax,
        lastCompletedDate: today,
      }));
    } else {
      set((s) => ({
        completedDailyDates: s.completedDailyDates.includes(dailyKey)
          ? s.completedDailyDates
          : [...s.completedDailyDates, dailyKey],
      }));
    }

    return { streakBonusCoins, newStreak };
  },

  clearDailyCompleted: (dailyKey: string) => {
    appStorage.delete(`${StorageKeys.DAILY_COMPLETED_PREFIX}${dailyKey}`);
    set((s) => ({
      completedDailyDates: s.completedDailyDates.filter((k) => k !== dailyKey),
    }));
  },

  isDailyCompleted: (dailyKey: string) => {
    if (get().completedDailyDates.includes(dailyKey)) return true;
    return appStorage.getBoolean(`${StorageKeys.DAILY_COMPLETED_PREFIX}${dailyKey}`) ?? false;
  },

  recordGameResult: (isWon: boolean, attemptsUsed: number) => {
    set((state) => {
      const gamesPlayed = state.gamesPlayed + 1;
      const gamesWon = isWon ? state.gamesWon + 1 : state.gamesWon;
      const guessDistribution = { ...state.guessDistribution };

      if (isWon && attemptsUsed > 0) {
        guessDistribution[attemptsUsed] = (guessDistribution[attemptsUsed] || 0) + 1;
      }

      const nextStats: IGameStats = { gamesPlayed, gamesWon, guessDistribution };
      appStorage.set(StorageKeys.GAME_STATS, JSON.stringify(nextStats));

      return nextStats;
    });
  },

  unlockCosmetic: (id: string, cost: number) => {
    const { coins, unlockedCosmetics, spendCoins } = get();
    if (unlockedCosmetics.includes(id)) {
      get().equipCosmetic(id);
      return true;
    }
    if (coins < cost) return false;

    const spent = spendCoins(cost);
    if (!spent) return false;

    const nextList = [...unlockedCosmetics, id];
    appStorage.set(StorageKeys.UNLOCKED_COSMETICS, JSON.stringify(nextList));
    appStorage.set(StorageKeys.EQUIPPED_COSMETIC_ID, id);

    set({
      unlockedCosmetics: nextList,
      equippedCosmeticId: id,
    });
    return true;
  },

  equipCosmetic: (id: string) => {
    const { unlockedCosmetics } = get();
    if (!unlockedCosmetics.includes(id) && id !== 'avatar_default') return;

    appStorage.set(StorageKeys.EQUIPPED_COSMETIC_ID, id);
    set({ equippedCosmeticId: id });
  },

  isCosmeticUnlocked: (id: string) => {
    if (id === 'avatar_default') return true;
    return get().unlockedCosmetics.includes(id);
  },

  hydrateFromStorage: () => {
    const freshStats = loadInitialStats();
    set({
      coins: loadInitialCoins(),
      xp: loadInitialXp(),
      unlockedLevels: loadInitialLevels(),
      currentStreak: appStorage.getNumber(StorageKeys.CURRENT_STREAK) ?? 0,
      maxStreak: appStorage.getNumber(StorageKeys.MAX_STREAK) ?? 0,
      lastCompletedDate: appStorage.getString(StorageKeys.LAST_COMPLETED_DATE) ?? null,
      gamesPlayed: freshStats.gamesPlayed,
      gamesWon: freshStats.gamesWon,
      guessDistribution: freshStats.guessDistribution,
      unlockedCosmetics: loadInitialUnlockedCosmetics(),
      equippedCosmeticId: loadInitialEquippedCosmetic(),
    });
  },
}));
