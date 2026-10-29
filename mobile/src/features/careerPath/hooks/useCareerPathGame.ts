import { useState, useCallback, useEffect } from 'react';
import { ICareerPathGuess } from '../types';
import { ILightPlayer } from '../../../services/searchEngine';
import { hapticsService } from '../../../services/hapticsService';
import { dailyStorage } from '../../daily/utils/dailyStorage';
import { useGameStore } from '../../../stores/useGameStore';

interface IUseCareerPathGameProps {
  targetPlayerId: string;
  targetPlayerName?: string;
  maxAttempts?: number;
  gameModeKey?: string;
  leagueModeKey?: string;
  isDaily?: boolean;
  isReplay?: boolean;
  dailyKey?: string;
  isLegendLevel?: boolean;
  onWin?: () => void;
}

export const useCareerPathGame = ({
  targetPlayerId,
  targetPlayerName,
  maxAttempts = 6,
  gameModeKey = 'careerPath',
  leagueModeKey = 'super_lig',
  isDaily = false,
  isReplay = false,
  dailyKey,
  isLegendLevel = false,
  onWin,
}: IUseCareerPathGameProps) => {
  const [guesses, setGuesses] = useState<ICareerPathGuess[]>([]);
  const [extraAttempts, setExtraAttempts] = useState(0);
  const [hasRevived, setHasRevived] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const effectiveMaxAttempts = maxAttempts + extraAttempts;

  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
  const clearDailyCompleted = useGameStore((s) => s.clearDailyCompleted);
  const recordGameResult = useGameStore((s) => s.recordGameResult);

  useEffect(() => {
    if (isDaily && dailyKey) {
      const saved = dailyStorage.getSession<ICareerPathGuess>(dailyKey);
      if (saved) {
        setGuesses(saved.guesses);
        setGameStatus(saved.status);
        return;
      }
    }
    setGuesses([]);
    setExtraAttempts(0);
    setHasRevived(false);
    setGameStatus('playing');
  }, [targetPlayerId, isDaily, dailyKey]);

  const submitGuess = useCallback(
    (player: ILightPlayer) => {
      if (gameStatus !== 'playing') return;

      if (guesses.some((g) => g.playerId === player.id)) {
        return;
      }

      const isCorrect =
        player.id === targetPlayerId ||
        Boolean(
          targetPlayerName &&
            player.name.toLowerCase().trim() === targetPlayerName.toLowerCase().trim()
        );

      const newGuess: ICareerPathGuess = {
        playerId: player.id,
        playerName: player.name,
        club: player.club,
        isCorrect,
      };

      const updated = [...guesses, newGuess];
      setGuesses(updated);

      if (isCorrect) {
        hapticsService.success();
        setGameStatus('won');
        recordGameResult(true, updated.length);

        if (!isReplay) {
          if (isDaily && dailyKey) {
            const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
            addCoins(30 + streakBonusCoins);
            addXp(80);

            dailyStorage.saveSession(dailyKey, {
              dailyKey,
              status: 'won',
              guesses: updated,
              attemptsUsed: updated.length,
              completedAt: new Date().toISOString(),
            });
          } else {
            const coinReward = isLegendLevel ? 70 : 20;
            const xpReward = isLegendLevel ? 100 : 50;  
            addCoins(coinReward);
            addXp(xpReward);
            unlockNextLevel(gameModeKey, leagueModeKey);
          }
        }

        onWin?.();
      } else if (updated.length >= effectiveMaxAttempts) {
        hapticsService.error();
        setGameStatus('lost');

        if (hasRevived) {
          recordGameResult(false, effectiveMaxAttempts);
          if (isDaily && dailyKey) {
            dailyStorage.saveSession(dailyKey, {
              dailyKey,
              status: 'lost',
              guesses: updated,
              attemptsUsed: updated.length,
              completedAt: new Date().toISOString(),
            });
            markDailyCompleted(dailyKey, false);
          }
        }
      } else {
        hapticsService.warning();
      }
    },
    [
      gameStatus,
      guesses,
      targetPlayerId,
      targetPlayerName,
      effectiveMaxAttempts,
      hasRevived,
      isLegendLevel,
      addCoins,
      addXp,
      isDaily,
      isReplay,
      dailyKey,
      markDailyCompleted,
      recordGameResult,
      unlockNextLevel,
      gameModeKey,
      leagueModeKey,
      onWin,
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
      recordGameResult(false, effectiveMaxAttempts);
      if (isDaily && dailyKey) {
        dailyStorage.saveSession(dailyKey, {
          dailyKey,
          status: 'lost',
          guesses,
          attemptsUsed: guesses.length,
          completedAt: new Date().toISOString(),
        });
        markDailyCompleted(dailyKey, false);
      }
    }
  }, [gameStatus, effectiveMaxAttempts, isDaily, dailyKey, guesses, recordGameResult, markDailyCompleted]);

  const openSearch = useCallback(() => {
    if (gameStatus === 'playing') setIsSearchModalVisible(true);
  }, [gameStatus]);

  const closeSearch = useCallback(() => {
    setIsSearchModalVisible(false);
  }, []);

  const resetGame = useCallback(() => {
    setGuesses([]);
    setExtraAttempts(0);
    setHasRevived(false);
    setGameStatus('playing');
  }, []);

  return {
    guesses,
    gameStatus,
    attemptsLeft: Math.max(0, effectiveMaxAttempts - guesses.length),
    maxAttempts: effectiveMaxAttempts,
    canRevive: !hasRevived,
    isSearchModalVisible,
    openSearch,
    closeSearch,
    submitGuess,
    reviveGame,
    finalizeLoss,
    resetGame,
  };
};
