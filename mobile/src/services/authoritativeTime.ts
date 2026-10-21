import { systemApi } from '../api/systemApi';
import { appStorage, StorageKeys } from '../storage/mmkv';

class AuthoritativeTimeService {
  private offsetMs: number = 0;
  private isSynchronized: boolean = false;

  constructor() {
    const cachedOffset = appStorage.getNumber(StorageKeys.SERVER_TIME_OFFSET_MS);
    if (cachedOffset !== undefined && !isNaN(cachedOffset)) {
      this.offsetMs = cachedOffset;
    }
  }

  public async sync(): Promise<string> {
    try {
      const data = await systemApi.getSystemTime();
      const clientNow = Date.now();
      this.offsetMs = data.serverUtcTimestamp - clientNow;
      this.isSynchronized = true;

      appStorage.set(StorageKeys.SERVER_TIME_OFFSET_MS, this.offsetMs);
      if (data.serverUtcDate) {
        appStorage.set(StorageKeys.LAST_SERVER_UTC_DATE, data.serverUtcDate);
      }

      return data.serverUtcDate;
    } catch {
      return this.getAuthoritativeUtcDate();
    }
  }

  public getAuthoritativeTimestamp(): number {
    return Date.now() + this.offsetMs;
  }

  public getAuthoritativeDate(): Date {
    return new Date(this.getAuthoritativeTimestamp());
  }

  public getAuthoritativeUtcDate(): string {
    const d = this.getAuthoritativeDate();
    return d.toISOString().split('T')[0];
  }

  public isSynced(): boolean {
    return this.isSynchronized;
  }
}

export const authoritativeTime = new AuthoritativeTimeService();

export const getAuthoritativeUtcDate = (): string => {
  return authoritativeTime.getAuthoritativeUtcDate();
};
