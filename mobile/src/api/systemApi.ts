import { apiClient } from './client';

export interface ISystemTimeData {
  serverUtcIso: string;
  serverUtcDate: string;
  serverUtcTimestamp: number;
  secondsUntilDailyReset: number;
}

export const systemApi = {
  getSystemTime: async (): Promise<ISystemTimeData> => {
    const res = await apiClient.get('/system/time');
    return res.data;
  },

  getSearchIndex: async () => {
    const res = await apiClient.get('/players/search-index');
    return res.data.data;
  },
};
