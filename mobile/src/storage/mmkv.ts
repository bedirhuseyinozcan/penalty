import { Platform, NativeModules } from 'react-native';

export interface IAppStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string | boolean | number): void;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  delete(key: string): void;
  clearAll(): void;
}

class UniversalStorage implements IAppStorage {
  private memory = new Map<string, string>();
  private nativeMMKV: any = null;

  constructor() {
    this.initNativeMMKV();
  }

  private initNativeMMKV(): void {
    if (Platform.OS === 'web') {
      return;
    }

    const globalAny = globalThis as any;
    const isExpoGo =
      Boolean(globalAny?.expo?.modules?.ExpoGo) ||
      Boolean(NativeModules?.NativeUnimoduleProxy?.modulesConstants?.ExponentConstants?.appOwnership === 'expo') ||
      Boolean(NativeModules?.ExponentConstants?.appOwnership === 'expo');

    const hasNativeMMKV =
      Boolean(NativeModules?.MMKVNative) || typeof globalAny?.mmkvCreateNewInstance === 'function';

    if (isExpoGo || !hasNativeMMKV) {
      return;
    }

    try {
      const { MMKV } = require('react-native-mmkv');
      this.nativeMMKV = new MMKV({
        id: 'penalty-storage',
        encryptionKey: 'penalty-studio-enc-key-2026',
      });
    } catch (e) {
      this.nativeMMKV = null;
    }
  }

  getString(key: string): string | undefined {
    if (this.nativeMMKV) {
      try {
        return this.nativeMMKV.getString(key);
      } catch {}
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const val = localStorage.getItem(key);
        return val === null ? undefined : val;
      } catch {}
    }
    return this.memory.get(key);
  }

  set(key: string, value: string | boolean | number): void {
    if (this.nativeMMKV) {
      try {
        this.nativeMMKV.set(key, value);
        return;
      } catch {}
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, String(value));
        return;
      } catch {}
    }
    this.memory.set(key, String(value));
  }

  getBoolean(key: string): boolean | undefined {
    if (this.nativeMMKV) {
      try {
        return this.nativeMMKV.getBoolean(key);
      } catch {}
    }
    const val = this.getString(key);
    return val === undefined ? undefined : val === 'true';
  }

  getNumber(key: string): number | undefined {
    if (this.nativeMMKV) {
      try {
        return this.nativeMMKV.getNumber(key);
      } catch {}
    }
    const val = this.getString(key);
    return val === undefined ? undefined : Number(val);
  }

  delete(key: string): void {
    if (this.nativeMMKV) {
      try {
        this.nativeMMKV.delete(key);
        return;
      } catch {}
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {}
    }
    this.memory.delete(key);
  }

  clearAll(): void {
    if (this.nativeMMKV) {
      try {
        this.nativeMMKV.clearAll();
        return;
      } catch {}
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.clear();
        return;
      } catch {}
    }
    this.memory.clear();
  }
}

export const appStorage = new UniversalStorage();

export const StorageKeys = {
  USER_COINS: 'penalty_user_coins',
  USER_XP: 'penalty_user_xp',
  UNLOCKED_LEVELS: 'penalty_unlocked_levels',
  SEARCH_INDEX_CACHE: 'penalty_search_index_cache_v3',
  SEARCH_INDEX_TIMESTAMP: 'penalty_search_index_timestamp',
  SELECTED_LEAGUE_MODE: 'penalty_selected_league_mode',
  SOUND_ENABLED: 'penalty_sound_enabled',
  HAPTICS_ENABLED: 'penalty_haptics_enabled',
  DAILY_COMPLETED_PREFIX: 'penalty_daily_completed_',
  DAILY_SESSION_PREFIX: 'penalty_daily_session_',
  LEVEL_CACHE_PREFIX: 'penalty_level_cache_v4_',
  CURRENT_STREAK: 'penalty_current_streak',
  MAX_STREAK: 'penalty_max_streak',
  LAST_COMPLETED_DATE: 'penalty_last_completed_date',
  GAME_STATS: 'penalty_game_stats',
  SERVER_TIME_OFFSET_MS: 'penalty_server_time_offset_ms',
  LAST_SERVER_UTC_DATE: 'penalty_last_server_utc_date',
  UNLOCKED_COSMETICS: 'penalty_unlocked_cosmetics',
  EQUIPPED_COSMETIC_ID: 'penalty_equipped_cosmetic_id',
} as const;
