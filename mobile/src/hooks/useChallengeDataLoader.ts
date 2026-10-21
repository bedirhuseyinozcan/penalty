import { useState, useEffect, useCallback, useMemo } from 'react';
import { dailyApi, GameModeType } from '../api/dailyApi';
import { levelApi } from '../api/levelApi';
import { levelCacheService } from '../services/levelCacheService';
import { getAuthoritativeUtcDate } from '../services/authoritativeTime';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useGameStore } from '../stores/useGameStore';

export interface IUnifiedChallengeData {
  targetPlayerId: string;
  playerName?: string;
  playerClub?: string;
  imageUrl?: string;
  blurImages?: string[];
  hints?: string[];
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
  gameMode: GameModeType;
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

  const todayDate = useMemo(() => getAuthoritativeUtcDate(), []);
  const dailyKey = `${todayDate}_${gameMode}_${selectedLeagueMode}`;
  const alreadyCompleted = isDaily && isDailyCompleted(dailyKey);

  const loadData = useCallback(async () => {
    if (gameMode === 'ticTacToe' || gameMode === 'footballBingo') {
      setIsLoading(false);
      return;
    }

    if (!isDaily) {
      const cached = levelCacheService.getLevel(currentLevel, gameMode, selectedLeagueMode);
      if (cached) {
        setChallengeData({
          targetPlayerId: cached.targetPlayerId || `level_${currentLevel}`,
          playerName: cached.playerName,
          playerClub: cached.playerClub,
          imageUrl: cached.imageUrl || cached.initialBlurImageUrl,
          blurImages: cached.blurImages || [],
          hints: cached.hints || [],
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
          hints: data.hints || [],
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
      const fallback = levelCacheService.getLevel(
        isDaily ? 1 : currentLevel,
        gameMode,
        selectedLeagueMode
      );
      if (fallback) {
        setChallengeData({
          targetPlayerId: fallback.targetPlayerId || `level_${currentLevel}`,
          playerName: fallback.playerName,
          playerClub: fallback.playerClub,
          imageUrl: fallback.imageUrl || fallback.initialBlurImageUrl,
          blurImages: fallback.blurImages || [],
          hints: fallback.hints || [],
          careerPath: fallback.careerPath || [],
          dailyKey: isDaily ? dailyKey : undefined,
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
    setCurrentLevel((prev) => prev + 1);
    setIsCurrentReplay(false);
  }, []);

  return {
    isLoading,
    challengeData,
    currentLevel,
    isCurrentReplay,
    dailyKey,
    alreadyCompleted,
    selectedLeagueMode,
    goToNextLevel,
  };
};
