import { useState, useEffect, useCallback, useMemo } from 'react';
import { dailyApi } from '../api/dailyApi';
import { levelApi } from '../api/levelApi';
import { levelCacheService } from '../services/levelCacheService';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useGameStore } from '../stores/useGameStore';

export interface IUnifiedChallengeData {
  targetPlayerId: string;
  playerName?: string;
  playerClub?: string;
  imageUrl?: string;
  blurImages?: string[];
  careerPath?: Array<{
    clubName: string;
    clubLogoUrl?: string;
    startYear: number;
    endYear?: number;
    apps?: number;
    goals?: number;
  }>;
  dailyKey?: string;
}

interface IUseChallengeDataLoaderProps {
  gameMode: 'whoAreYa' | 'careerPath';
  isDaily?: boolean;
  initialLevel?: number;
  isReplay?: boolean;
}

export const useChallengeDataLoader = ({
  gameMode,
  isDaily = false,
  initialLevel,
  isReplay = false,
}: IUseChallengeDataLoaderProps) => {
  const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);
  const getUnlockedLevel = useGameStore((s) => s.getUnlockedLevel);
  const isDailyCompleted = useGameStore((s) => s.isDailyCompleted);

  const [isLoading, setIsLoading] = useState(true);
  const [challengeData, setChallengeData] = useState<IUnifiedChallengeData | null>(null);

  const [currentLevel, setCurrentLevel] = useState(() =>
    initialLevel ?? getUnlockedLevel(gameMode, selectedLeagueMode)
  );
  const [isCurrentReplay, setIsCurrentReplay] = useState(isReplay);

  useEffect(() => {
    if (initialLevel != null) {
      setCurrentLevel(initialLevel);
      setIsCurrentReplay(isReplay);
    } else {
      setCurrentLevel(getUnlockedLevel(gameMode, selectedLeagueMode));
      setIsCurrentReplay(false);
    }
  }, [initialLevel, isReplay, selectedLeagueMode, getUnlockedLevel, gameMode]);

  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const dailyKey = `${todayDate}_${gameMode}_${selectedLeagueMode}`;
  const alreadyCompleted = isDaily && isDailyCompleted(dailyKey);

  const loadData = useCallback(async () => {
    if (!isDaily) {
      const cached = levelCacheService.getLevel(currentLevel, gameMode, selectedLeagueMode);
      if (cached) {
        setChallengeData({
          targetPlayerId: cached.targetPlayerId || `level_${currentLevel}`,
          playerName: cached.playerName,
          playerClub: cached.playerClub,
          imageUrl: cached.imageUrl || cached.initialBlurImageUrl,
          blurImages: cached.blurImages || [],
          careerPath: cached.careerPath || [],
        });
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    } else {
      setIsLoading(true);
    }

    try {
      if (isDaily) {
        const data = await dailyApi.getTodayChallenge(gameMode, selectedLeagueMode);
        setChallengeData({
          targetPlayerId: data.targetPlayerId || data.id,
          playerName: data.playerName,
          playerClub: data.playerClub,
          imageUrl: data.imageUrl || data.initialBlurImageUrl,
          blurImages: data.blurImages || [],
          careerPath: data.careerPath || [],
          dailyKey,
        });
      } else {
        const data = await levelApi.getLevel(currentLevel, gameMode, selectedLeagueMode);
        setChallengeData({
          targetPlayerId: data.targetPlayerId || `level_${currentLevel}`,
          playerName: data.playerName,
          playerClub: data.playerClub,
          imageUrl: data.imageUrl || data.initialBlurImageUrl,
          blurImages: data.blurImages || [],
          careerPath: data.careerPath || [],
        });

        levelCacheService.cacheLevel(data);

        if (currentLevel === 1 || currentLevel % 10 === 0) {
          levelCacheService.syncLevelPack(
            gameMode,
            selectedLeagueMode,
            currentLevel,
            currentLevel + 19
          );
        }
      }
    } catch {
    
      if (!isDaily) {
        const fallback = levelCacheService.getLevel(currentLevel, gameMode, selectedLeagueMode);
        if (fallback) {
          setChallengeData({
            targetPlayerId: fallback.targetPlayerId || `level_${currentLevel}`,
            playerName: fallback.playerName,
            playerClub: fallback.playerClub,
            imageUrl: fallback.imageUrl || fallback.initialBlurImageUrl,
            blurImages: fallback.blurImages || [],
            careerPath: fallback.careerPath || [],
          });
        }
      } else {
       
        setChallengeData({
          targetPlayerId: selectedLeagueMode === 'super_lig' ? 'tmid_68863' : 'tmid_418560',
          playerName: selectedLeagueMode === 'super_lig' ? 'Mauro Icardi' : 'Erling Haaland',
          playerClub: selectedLeagueMode === 'super_lig' ? 'Galatasaray' : 'Manchester City',
          dailyKey,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameMode, isDaily, selectedLeagueMode, currentLevel, dailyKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goToNextLevel = useCallback(() => {
    setIsCurrentReplay(false);
    setCurrentLevel((prev) => prev + 1);
  }, []);

  return {
    isLoading,
    challengeData,
    currentLevel,
    isCurrentReplay,
    dailyKey,
    alreadyCompleted,
    selectedLeagueMode,
    reload: loadData,
    goToNextLevel,
  };
};
