import { useState, useCallback, useMemo, useEffect } from 'react';
import { searchEngine, ILightPlayer } from '../../../services/searchEngine';
import { useSettingsStore } from '../../../stores/useSettingsStore';

export const useOfflinePlayerSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const leagueMode = useSettingsStore((s) => s.selectedLeagueMode);

  useEffect(() => {
    if (query.trim().length < 2) {
      setDebouncedQuery(query);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) return [];
    return searchEngine.search(debouncedQuery, leagueMode);
  }, [debouncedQuery, leagueMode]);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    results,
    handleQueryChange,
    clearSearch,
  };
};
