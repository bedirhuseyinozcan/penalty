import { useState, useCallback, useEffect, useMemo } from 'react';
import { IClubSearchItem, searchEngine } from '../../../services/searchEngine';
import { useGameStore } from '../../../stores/useGameStore';
import { hapticsService } from '../../../services/hapticsService';
import { dailyStorage } from '../../daily/utils/dailyStorage';

export interface IClubGuessResult {
  club: IClubSearchItem;
  isCorrect: boolean;
  isSameLeague: boolean;
}

interface IUseClubLogoGameProps {
  targetClubName: string;
  isDaily?: boolean;
  isReplay?: boolean;
  dailyKey?: string;
  leagueModeKey?: string;
}

const MAX_ATTEMPTS = 6;

export const useClubLogoGame = ({
  targetClubName,
  isDaily = false,
  isReplay = false,
  dailyKey = '',
  leagueModeKey = 'super_lig',
}: IUseClubLogoGameProps) => {
  const [guesses, setGuesses] = useState<IClubGuessResult[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
  const recordGameResult = useGameStore((s) => s.recordGameResult);

  const targetClubInfo = useMemo(
    () => searchEngine.getClubByName(targetClubName),
    [targetClubName]
  );

  useEffect(() => {
    if (isDaily && dailyKey) {
      const saved = dailyStorage.getSession<IClubGuessResult>(dailyKey);
      if (saved && saved.guesses && saved.guesses.length > 0) {
        setGuesses(saved.guesses);
        setGameStatus(saved.status);
        return;
      }
    }
    setGuesses([]);
    setGameStatus('playing');
  }, [targetClubName, isDaily, dailyKey]);

  const openSearch = useCallback(() => {
    if (gameStatus === 'playing') {
      hapticsService.light();
      setIsSearchModalVisible(true);
    }
  }, [gameStatus]);

  const closeSearch = useCallback(() => {
    setIsSearchModalVisible(false);
  }, []);

  const submitClubGuess = useCallback(
    (guessedClub: IClubSearchItem) => {
      if (gameStatus !== 'playing') return;

      if (guesses.some((g) => g.club.name.toLowerCase() === guessedClub.name.toLowerCase())) {
        closeSearch();
        return;
      }

      const normGuess = guessedClub.name.toLowerCase().trim();
      const normTarget = (targetClubName || '').toLowerCase().trim();
      const isCorrect =
        normGuess === normTarget ||
        (targetClubInfo != null && guessedClub.id === targetClubInfo.id);

      const isSameLeague =
        targetClubInfo != null ? guessedClub.league === targetClubInfo.league : true;

      const newEntry: IClubGuessResult = {
        club: guessedClub,
        isCorrect,
        isSameLeague,
      };

      const nextGuesses = [newEntry, ...guesses];
      setGuesses(nextGuesses);
      closeSearch();

      let nextStatus: 'playing' | 'won' | 'lost' = 'playing';

      if (isCorrect) {
        nextStatus = 'won';
        setGameStatus('won');
        hapticsService.success();
        recordGameResult(true, nextGuesses.length);

        if (isDaily && dailyKey) {
          const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
          addCoins(40 + streakBonusCoins);
          addXp(80);
        } else if (!isReplay) {
          addCoins(30);
          addXp(50);
          unlockNextLevel('clubLogo', leagueModeKey);
        }
      } else if (nextGuesses.length >= MAX_ATTEMPTS) {
        nextStatus = 'lost';
        setGameStatus('lost');
        hapticsService.error();
        recordGameResult(false, nextGuesses.length);

        if (isDaily && dailyKey) {
          markDailyCompleted(dailyKey, false);
        }
      } else {
        hapticsService.medium();
      }

      if (isDaily && dailyKey && nextStatus !== 'playing') {
        dailyStorage.saveSession(dailyKey, {
          dailyKey,
          guesses: nextGuesses,
          status: nextStatus,
          attemptsUsed: nextGuesses.length,
          completedAt: new Date().toISOString(),
        });
      }
    },
    [
      gameStatus,
      guesses,
      targetClubName,
      targetClubInfo,
      closeSearch,
      isDaily,
      isReplay,
      dailyKey,
      leagueModeKey,
      addCoins,
      addXp,
      unlockNextLevel,
      markDailyCompleted,
      recordGameResult,
    ]
  );

  const resetGame = useCallback(() => {
    setGuesses([]);
    setGameStatus('playing');
  }, []);

  return {
    guesses,
    gameStatus,
    isSearchModalVisible,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - guesses.length),
    maxAttempts: MAX_ATTEMPTS,
    openSearch,
    closeSearch,
    submitClubGuess,
    resetGame,
  };
};
