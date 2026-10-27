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
  const [extraAttempts, setExtraAttempts] = useState(0);
  const [hasRevived, setHasRevived] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const effectiveMaxAttempts = MAX_ATTEMPTS + extraAttempts;

  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
  const clearDailyCompleted = useGameStore((s) => s.clearDailyCompleted);
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
    setExtraAttempts(0);
    setHasRevived(false);
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

      if (isCorrect) {
        setGameStatus('won');
        hapticsService.success();
        recordGameResult(true, nextGuesses.length);

        if (isDaily && dailyKey) {
          const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
          addCoins(30 + streakBonusCoins);
          addXp(80);
          dailyStorage.saveSession(dailyKey, {
            dailyKey,
            guesses: nextGuesses,
            status: 'won',
            attemptsUsed: nextGuesses.length,
            completedAt: new Date().toISOString(),
          });
        } else if (!isReplay) {
          addCoins(20);
          addXp(50);
          unlockNextLevel('clubLogo', leagueModeKey);
        }
      } else if (nextGuesses.length >= effectiveMaxAttempts) {
        setGameStatus('lost');
        hapticsService.error();

        if (hasRevived) {
          recordGameResult(false, nextGuesses.length);
          if (isDaily && dailyKey) {
            markDailyCompleted(dailyKey, false);
            dailyStorage.saveSession(dailyKey, {
              dailyKey,
              guesses: nextGuesses,
              status: 'lost',
              attemptsUsed: nextGuesses.length,
              completedAt: new Date().toISOString(),
            });
          }
        }
      } else {
        hapticsService.medium();
      }
    },
    [
      gameStatus,
      guesses,
      targetClubName,
      targetClubInfo,
      effectiveMaxAttempts,
      hasRevived,
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

  const reviveGame = useCallback(() => {
    setHasRevived(true);
    setExtraAttempts((prev) => prev + 2);
    setGameStatus('playing');
    if (isDaily && dailyKey) {
      dailyStorage.deleteSession(dailyKey);
      clearDailyCompleted(dailyKey);
    }
  }, [isDaily, dailyKey, clearDailyCompleted]);

  const finalizeLoss = useCallback(() => {
    if (gameStatus === 'lost') {
      recordGameResult(false, guesses.length);
      if (isDaily && dailyKey) {
        dailyStorage.saveSession(dailyKey, {
          dailyKey,
          guesses,
          status: 'lost',
          attemptsUsed: guesses.length,
          completedAt: new Date().toISOString(),
        });
        markDailyCompleted(dailyKey, false);
      }
    }
  }, [gameStatus, isDaily, dailyKey, guesses, recordGameResult, markDailyCompleted]);

  const resetGame = useCallback(() => {
    setGuesses([]);
    setExtraAttempts(0);
    setHasRevived(false);
    setGameStatus('playing');
  }, []);

  return {
    guesses,
    gameStatus,
    isSearchModalVisible,
    attemptsLeft: Math.max(0, effectiveMaxAttempts - guesses.length),
    maxAttempts: effectiveMaxAttempts,
    canRevive: !hasRevived,
    openSearch,
    closeSearch,
    submitClubGuess,
    reviveGame,
    finalizeLoss,
    resetGame,
  };
};
