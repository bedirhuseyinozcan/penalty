import { create } from 'zustand';
import { appStorage, StorageKeys } from '../storage/mmkv';

export type LeagueMode = 'global' | 'super_lig';

interface ISettingsStore {
  selectedLeagueMode: LeagueMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  setLeagueMode: (mode: LeagueMode) => void;
  toggleLeagueMode: () => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  hydrateSettings: () => void;
}

const loadInitialLeagueMode = (): LeagueMode => {
  const saved = appStorage.getString(StorageKeys.SELECTED_LEAGUE_MODE);
  return saved === 'global' ? 'global' : 'super_lig'; 
};

export const useSettingsStore = create<ISettingsStore>((set) => ({
  selectedLeagueMode: loadInitialLeagueMode(),
  soundEnabled: appStorage.getBoolean(StorageKeys.SOUND_ENABLED) ?? true,
  hapticsEnabled: appStorage.getBoolean(StorageKeys.HAPTICS_ENABLED) ?? true,

  setLeagueMode: (mode: LeagueMode) => {
    appStorage.set(StorageKeys.SELECTED_LEAGUE_MODE, mode);
    set({ selectedLeagueMode: mode });
  },

  toggleLeagueMode: () => {
    set((state) => {
      const next: LeagueMode = state.selectedLeagueMode === 'super_lig' ? 'global' : 'super_lig';
      appStorage.set(StorageKeys.SELECTED_LEAGUE_MODE, next);
      return { selectedLeagueMode: next };
    });
  },

  toggleSound: () => {
    set((state) => {
      const next = !state.soundEnabled;
      appStorage.set(StorageKeys.SOUND_ENABLED, next);
      return { soundEnabled: next };
    });
  },

  toggleHaptics: () => {
    set((state) => {
      const next = !state.hapticsEnabled;
      appStorage.set(StorageKeys.HAPTICS_ENABLED, next);
      return { hapticsEnabled: next };
    });
  },

  hydrateSettings: () => {
    set({
      selectedLeagueMode: loadInitialLeagueMode(),
      soundEnabled: appStorage.getBoolean(StorageKeys.SOUND_ENABLED) ?? true,
      hapticsEnabled: appStorage.getBoolean(StorageKeys.HAPTICS_ENABLED) ?? true,
    });
  },
}));
