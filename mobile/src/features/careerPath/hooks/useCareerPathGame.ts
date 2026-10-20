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
  onWin,
}: IUseCareerPathGameProps) => {
  const [guesses, setGuesses] = useState<ICareerPathGuess[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const addCoins = useGameStore((s) => s.addCoins);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
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
    setGameStatus('playing');
  }, [targetPlayerId, isDaily, dailyKey]);

  const submitGuess = useCallback(
    (player: ILightPlayer) => {
      if (gameStatus !== 'playing') return;
      if (isDaily && dailyKey && dailyStorage.hasCompletedSession(dailyKey)) return;

      if (guesses.some((g) => g.playerId === player.id)) {
        return; // Prevent duplicate
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
          addCoins(35);

          if (isDaily && dailyKey) {
            dailyStorage.saveSession(dailyKey, {
              dailyKey,
              status: 'won',
              guesses: updated,
              attemptsUsed: updated.length,
              completedAt: new Date().toISOString(),
            });
            markDailyCompleted(dailyKey);
          } else {
            unlockNextLevel(gameModeKey, leagueModeKey);
          }
        }

        onWin?.();
      } else if (updated.length >= maxAttempts) {
        hapticsService.error();
        setGameStatus('lost');
        recordGameResult(false, maxAttempts);

        if (isDaily && dailyKey) {
          dailyStorage.saveSession(dailyKey, {
            dailyKey,
            status: 'lost',
            guesses: updated,
            attemptsUsed: updated.length,
            completedAt: new Date().toISOString(),
          });
          markDailyCompleted(dailyKey);
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
      maxAttempts,
      addCoins,
      isDaily,
      isReplay,
      dailyKey,
      markDailyCompleted,
      unlockNextLevel,
      gameModeKey,
      leagueModeKey,
      onWin,
    ]
  );

  const openSearch = useCallback(() => {
    if (gameStatus === 'playing') setIsSearchModalVisible(true);
  }, [gameStatus]);

  const closeSearch = useCallback(() => {
    setIsSearchModalVisible(false);
  }, []);

  const resetGame = useCallback(() => {
    setGuesses([]);
    setGameStatus('playing');
  }, []);

  return {
    guesses,
    gameStatus,
    attemptsLeft: maxAttempts - guesses.length,
    maxAttempts,
    isSearchModalVisible,
    openSearch,
    closeSearch,
    submitGuess,
    resetGame,
  };
};
