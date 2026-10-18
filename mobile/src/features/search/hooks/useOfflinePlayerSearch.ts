import { useState, useCallback, useMemo } from 'react';
import { searchEngine, ILightPlayer } from '../../../services/searchEngine';
import { useSettingsStore } from '../../../stores/useSettingsStore';

export const useOfflinePlayerSearch = () => {
  const [query, setQuery] = useState('');
  const leagueMode = useSettingsStore((s) => s.selectedLeagueMode);

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return [];
    return searchEngine.search(query, leagueMode);
  }, [query, leagueMode]);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    results,
    handleQueryChange,
    clearSearch,
  };
};
