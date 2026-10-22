import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IAppStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string | boolean | number): void;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  delete(key: string): void;
  clearAll(): void;
  hydrateFromDisk(): Promise<void>;
}

class UniversalStorage implements IAppStorage {
  private memory = new Map<string, string>();
  private nativeMMKV: any = null;
  private isHydrated = false;

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
      NativeModules?.NativeUnimoduleProxy?.modulesConstants?.ExponentConstants?.appOwnership === 'expo' ||
      NativeModules?.ExponentConstants?.appOwnership === 'expo';

    if (isExpoGo) {
      return;
    }

    try {
      const { MMKV } = require('react-native-mmkv');
      this.nativeMMKV = new MMKV({
        id: 'penalty-storage',
      });
      this.nativeMMKV.set('__mmkv_health_check__', 'ok');
      if (this.nativeMMKV.getString('__mmkv_health_check__') !== 'ok') {
        this.nativeMMKV = null;
      }
    } catch (e) {
      console.warn('MMKV JSI fallback to AsyncStorage disk persistence:', e);
      this.nativeMMKV = null;
    }
  }

  public async hydrateFromDisk(): Promise<void> {
    if (this.isHydrated || Platform.OS === 'web') {
      this.isHydrated = true;
      return;
    }
    try {
      const keys = await AsyncStorage.getAllKeys();
      const penaltyKeys = keys.filter((k) => k.startsWith('penalty_'));
      if (penaltyKeys.length > 0) {
        const pairs = await AsyncStorage.multiGet(penaltyKeys);
        for (const [k, v] of pairs) {
          if (k && v !== null) {
            this.memory.set(k, v);
          }
        }
      }
    } catch (e) {
      console.warn('Disk hydration warning:', e);
    } finally {
      this.isHydrated = true;
    }
  }

  getString(key: string): string | undefined {
    if (this.nativeMMKV) {
      try {
        const val = this.nativeMMKV.getString(key);
        if (val !== undefined) return val;
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
    const strVal = String(value);
    this.memory.set(key, strVal);

    if (this.nativeMMKV) {
      try {
        this.nativeMMKV.set(key, value);
      } catch {}
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, strVal);
      } catch {}
      return;
    }

    AsyncStorage.setItem(key, strVal).catch(() => {});
  }

  getBoolean(key: string): boolean | undefined {
    if (this.nativeMMKV) {
      try {
        const val = this.nativeMMKV.getBoolean(key);
        if (val !== undefined) return val;
      } catch {}
    }
    const val = this.getString(key);
    return val === undefined ? undefined : val === 'true';
  }

  getNumber(key: string): number | undefined {
    if (this.nativeMMKV) {
      try {
        const val = this.nativeMMKV.getNumber(key);
        if (val !== undefined) return val;
      } catch {}
    }
    const val = this.getString(key);
    return val === undefined ? undefined : Number(val);
  }

  delete(key: string): void {
    this.memory.delete(key);
    if (this.nativeMMKV) {
      try {
        this.nativeMMKV.delete(key);
      } catch {}
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch {}
      return;
    }
    AsyncStorage.removeItem(key).catch(() => {});
  }

  clearAll(): void {
    this.memory.clear();
    if (this.nativeMMKV) {
      try {
        this.nativeMMKV.clearAll();
      } catch {}
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.clear();
      } catch {}
      return;
    }
    AsyncStorage.clear().catch(() => {});
  }
}

export const appStorage = new UniversalStorage();

export const StorageKeys = {
  USER_COINS: 'penalty_user_coins',
  USER_XP: 'penalty_user_xp',
  UNLOCKED_LEVELS: 'penalty_unlocked_levels',
  UNLOCKED_COSMETICS: 'penalty_unlocked_cosmetics',
  EQUIPPED_COSMETIC_ID: 'penalty_equipped_cosmetic_id',
  SEARCH_INDEX_CACHE: 'penalty_search_index_cache_v6_2627',
  SEARCH_INDEX_TIMESTAMP: 'penalty_search_index_timestamp',
  SELECTED_LEAGUE_MODE: 'penalty_selected_league_mode',
  SOUND_ENABLED: 'penalty_sound_enabled',
  HAPTICS_ENABLED: 'penalty_haptics_enabled',
  DAILY_COMPLETED_PREFIX: 'penalty_daily_completed_',
  DAILY_SESSION_PREFIX: 'penalty_daily_session_',
  LEVEL_CACHE_PREFIX: 'penalty_level_cache_v6_2627_',
  CURRENT_STREAK: 'penalty_current_streak',
  MAX_STREAK: 'penalty_max_streak',
  LAST_COMPLETED_DATE: 'penalty_last_completed_date',
  GAME_STATS: 'penalty_game_stats',
  SERVER_TIME_OFFSET_MS: 'penalty_server_time_offset_ms',
  LAST_SERVER_UTC_DATE: 'penalty_last_server_utc_date',
} as const;
