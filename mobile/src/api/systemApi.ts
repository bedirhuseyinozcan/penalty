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

  getSearchIndex: async (leagueMode?: 'global' | 'super_lig') => {
    const res = await apiClient.get('/players/search-index', {
      params: { leagueMode },
    });
    return res.data.data;
  },
};
