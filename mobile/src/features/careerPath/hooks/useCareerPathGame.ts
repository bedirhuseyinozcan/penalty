import { useState, useCallback, useEffect } from 'react';
import { ICareerPathGuess } from '../types';
import { ILightPlayer } from '../../../services/searchEngine';
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

  useEffect(() => {
    setGuesses([]);
    setGameStatus('playing');
  }, [targetPlayerId]);

  const submitGuess = useCallback(
    (player: ILightPlayer) => {
      if (gameStatus !== 'playing') return;

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
        setGameStatus('won');

        if (!isReplay) {
          addCoins(35);

          if (isDaily && dailyKey) {
            markDailyCompleted(dailyKey);
          } else {
            unlockNextLevel(gameModeKey, leagueModeKey);
          }
        }

        onWin?.();
      } else if (updated.length >= maxAttempts) {
        setGameStatus('lost');
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
