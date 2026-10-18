import { useState, useCallback, useMemo } from 'react';
import { IWhoAreYaGuess, GameStatus, IGuessAttributeComparison } from '../types';
import { ILightPlayer, searchEngine } from '../../../services/searchEngine';
import { useGameStore } from '../../../stores/useGameStore';

interface IUseWhoAreYaGameProps {
  targetPlayerId: string;
  targetPlayerDetails?: {
    name: string;
    club: string;
    nationality: string;
    position: string;
    age: number;
    league: string;
    blurImages?: string[];
  };
  blurImages?: string[];
  maxAttempts?: number;
  gameModeKey?: string;
  leagueModeKey?: string;
  isDaily?: boolean;
  dailyKey?: string;
  onWin?: () => void;
}

export const useWhoAreYaGame = ({
  targetPlayerId,
  targetPlayerDetails,
  blurImages = [],
  maxAttempts = 8,
  gameModeKey = 'whoAreYa',
  leagueModeKey = 'super_lig',
  isDaily = false,
  dailyKey,
  onWin,
}: IUseWhoAreYaGameProps) => {
  const [guesses, setGuesses] = useState<IWhoAreYaGuess[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const addCoins = useGameStore((s) => s.addCoins);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);

  const currentBlurImageUrl = useMemo(() => {
    if (blurImages.length === 0) return undefined;
    const index = Math.min(guesses.length, blurImages.length - 1);
    return blurImages[index];
  }, [blurImages, guesses.length]);

  const evaluateGuess = useCallback(
    (guessedPlayer: ILightPlayer): IWhoAreYaGuess => {
      const isTarget = guessedPlayer.id === targetPlayerId;

      const target = targetPlayerDetails ?? searchEngine.getPlayerById(targetPlayerId);

      const comparison: IGuessAttributeComparison = {
        club: target?.club === guessedPlayer.club ? 'correct' : 'wrong',
        league: target?.league === guessedPlayer.league ? 'correct' : 'wrong',
        nationality:
          target?.nationality.toLowerCase() === guessedPlayer.nationality.toLowerCase()
            ? 'correct'
            : 'wrong',
        position: target?.position === guessedPlayer.position ? 'correct' : 'wrong',
        age: 'correct',
      };

      if (target?.age != null) {
        const guessAge = guessedPlayer.age ?? 26;
        if (target.age > guessAge) comparison.age = 'higher';
        else if (target.age < guessAge) comparison.age = 'lower';
      }

      return {
        player: guessedPlayer,
        comparison,
        isTarget,
      };
    },
    [targetPlayerId, targetPlayerDetails]
  );

  const submitGuess = useCallback(
    (guessedPlayer: ILightPlayer) => {
      if (gameStatus !== 'playing') return;

      if (guesses.some((g) => g.player.id === guessedPlayer.id)) {
        return;
      }

      const evaluated = evaluateGuess(guessedPlayer);
      const nextGuesses = [...guesses, evaluated];
      setGuesses(nextGuesses);

      if (evaluated.isTarget) {
        setGameStatus('won');
        addCoins(30);

        if (isDaily && dailyKey) {
          markDailyCompleted(dailyKey);
        } else {
          unlockNextLevel(gameModeKey, leagueModeKey);
        }

        onWin?.();
      } else if (nextGuesses.length >= maxAttempts) {
        setGameStatus('lost');
      }
    },
    [
      gameStatus,
      guesses,
      evaluateGuess,
      maxAttempts,
      addCoins,
      isDaily,
      dailyKey,
      markDailyCompleted,
      unlockNextLevel,
      gameModeKey,
      leagueModeKey,
      onWin,
    ]
  );

  const openSearch = useCallback(() => {
    if (gameStatus === 'playing') {
      setIsSearchModalVisible(true);
    }
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
    currentBlurImageUrl,
    isSearchModalVisible,
    attemptsLeft: maxAttempts - guesses.length,
    maxAttempts,
    openSearch,
    closeSearch,
    submitGuess,
    resetGame,
  };
};
