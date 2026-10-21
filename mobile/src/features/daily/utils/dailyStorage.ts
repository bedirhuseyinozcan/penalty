import { appStorage, StorageKeys } from '../../../storage/mmkv';
import { IDailySavedSession } from '../types';

export const dailyStorage = {
  saveSession: <T>(dailyKey: string, session: IDailySavedSession<T>): void => {
    try {
      const key = `${StorageKeys.DAILY_SESSION_PREFIX}${dailyKey}`;
      appStorage.set(key, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save daily session:', e);
    }
  },

  getSession: <T>(dailyKey: string): IDailySavedSession<T> | null => {
    try {
      const key = `${StorageKeys.DAILY_SESSION_PREFIX}${dailyKey}`;
      const raw = appStorage.getString(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse daily session:', e);
    }
    return null;
  },

  hasCompletedSession: (dailyKey: string): boolean => {
    const key = `${StorageKeys.DAILY_SESSION_PREFIX}${dailyKey}`;
    return Boolean(appStorage.getString(key));
  },

  deleteSession: (dailyKey: string): void => {
    try {
      const key = `${StorageKeys.DAILY_SESSION_PREFIX}${dailyKey}`;
      appStorage.delete(key);
    } catch (e) {
      console.warn('Failed to delete daily session:', e);
    }
  },
};
