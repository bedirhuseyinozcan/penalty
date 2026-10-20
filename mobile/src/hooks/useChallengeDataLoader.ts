import { useState, useEffect, useCallback, useMemo } from 'react';
import { dailyApi } from '../api/dailyApi';
import { levelApi } from '../api/levelApi';
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
    setIsLoading(true);
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
      }
    } catch {
      // Offline fallback
      if (gameMode === 'whoAreYa') {
        setChallengeData({
          targetPlayerId: selectedLeagueMode === 'super_lig' ? 'tmid_12345' : 'tmid_12346',
          imageUrl:
            selectedLeagueMode === 'super_lig'
              ? 'https://img.a.transfermarkt.technology/portrait/big/68863-1671105169.png'
              : 'https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png',
          blurImages: [],
          playerName: selectedLeagueMode === 'super_lig' ? 'Mauro Icardi' : 'Erling Haaland',
          playerClub: selectedLeagueMode === 'super_lig' ? 'Galatasaray' : 'Manchester City',
          dailyKey,
        });
      } else {
        setChallengeData({
          targetPlayerId: selectedLeagueMode === 'super_lig' ? 'tmid_12348' : 'tmid_12346',
          playerName: selectedLeagueMode === 'super_lig' ? 'Edin Džeko' : 'Erling Haaland',
          playerClub: selectedLeagueMode === 'super_lig' ? 'Fenerbahçe' : 'Manchester City',
          careerPath:
            selectedLeagueMode === 'super_lig'
              ? [
                  { clubName: 'Željezničar', startYear: 2003, endYear: 2005 },
                  { clubName: 'Teplice', startYear: 2005, endYear: 2007 },
                  { clubName: 'VfL Wolfsburg', startYear: 2007, endYear: 2011, apps: 142, goals: 85 },
                  { clubName: 'Manchester City', startYear: 2011, endYear: 2016, apps: 189, goals: 72 },
                  { clubName: 'AS Roma', startYear: 2015, endYear: 2021, apps: 260, goals: 119 },
                  { clubName: 'Inter', startYear: 2021, endYear: 2023, apps: 101, goals: 31 },
                  { clubName: 'Fenerbahçe', startYear: 2023 },
                ]
              : [
                  { clubName: 'Bryne FK', startYear: 2015, endYear: 2017 },
                  { clubName: 'Molde', startYear: 2017, endYear: 2019, apps: 50, goals: 20 },
                  { clubName: 'Red Bull Salzburg', startYear: 2019, endYear: 2020, apps: 27, goals: 29 },
                  { clubName: 'Borussia Dortmund', startYear: 2020, endYear: 2022, apps: 89, goals: 86 },
                  { clubName: 'Manchester City', startYear: 2022, apps: 100, goals: 90 },
                ],
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
