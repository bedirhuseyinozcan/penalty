import { useState, useCallback, useMemo, useEffect } from 'react';
import { IWhoAreYaGuess, GameStatus, IGuessAttributeComparison } from '../types';
import { ILightPlayer, searchEngine } from '../../../services/searchEngine';
import { hapticsService } from '../../../services/hapticsService';
import { dailyStorage } from '../../daily/utils/dailyStorage';
import { useGameStore } from '../../../stores/useGameStore';

interface IUseWhoAreYaGameProps {
  targetPlayerId: string;
  targetPlayerName?: string;
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
  isReplay?: boolean;
  dailyKey?: string;
  onWin?: () => void;
}

export const useWhoAreYaGame = ({
  targetPlayerId,
  targetPlayerName,
  targetPlayerDetails,
  blurImages = [],
  maxAttempts = 8,
  gameModeKey = 'whoAreYa',
  leagueModeKey = 'super_lig',
  isDaily = false,
  isReplay = false,
  dailyKey,
  onWin,
}: IUseWhoAreYaGameProps) => {
  const [guesses, setGuesses] = useState<IWhoAreYaGuess[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const addCoins = useGameStore((s) => s.addCoins);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
  const recordGameResult = useGameStore((s) => s.recordGameResult);

  useEffect(() => {
    if (isDaily && dailyKey) {
      const saved = dailyStorage.getSession<IWhoAreYaGuess>(dailyKey);
      if (saved) {
        setGuesses(saved.guesses);
        setGameStatus(saved.status);
        return;
      }
    }
    setGuesses([]);
    setGameStatus('playing');
  }, [targetPlayerId, isDaily, dailyKey]);

  const currentBlurImageUrl = useMemo(() => {
    if (blurImages.length === 0) return undefined;
    const index = Math.min(guesses.length, blurImages.length - 1);
    return blurImages[index];
  }, [blurImages, guesses.length]);

  const evaluateGuess = useCallback(
    (guessedPlayer: ILightPlayer): IWhoAreYaGuess => {
      const target = targetPlayerDetails ?? searchEngine.getPlayerById(targetPlayerId);

      const isNameMatch =
        (targetPlayerName &&
          guessedPlayer.name.toLowerCase().trim() === targetPlayerName.toLowerCase().trim()) ||
        (target && target.name.toLowerCase().trim() === guessedPlayer.name.toLowerCase().trim());

      const isIdMatch = guessedPlayer.id === targetPlayerId;

      const comparison: IGuessAttributeComparison = {
        club: target?.club === guessedPlayer.club ? 'correct' : 'wrong',
        league: target?.league === guessedPlayer.league ? 'correct' : 'wrong',
        nationality:
          target?.nationality?.toLowerCase() === guessedPlayer.nationality?.toLowerCase()
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

      const allAttributesMatch =
        comparison.club === 'correct' &&
        comparison.league === 'correct' &&
        comparison.nationality === 'correct' &&
        comparison.position === 'correct' &&
        comparison.age === 'correct';

      const isTarget = isIdMatch || isNameMatch || allAttributesMatch;

      if (isTarget) {
        comparison.club = 'correct';
        comparison.league = 'correct';
        comparison.nationality = 'correct';
        comparison.position = 'correct';
        comparison.age = 'correct';
      }

      return {
        player: guessedPlayer,
        comparison,
        isTarget,
      };
    },
    [targetPlayerId, targetPlayerDetails, targetPlayerName]
  );

  const submitGuess = useCallback(
    (guessedPlayer: ILightPlayer) => {
      if (gameStatus !== 'playing') return;
      if (isDaily && dailyKey && dailyStorage.hasCompletedSession(dailyKey)) return;

      if (guesses.some((g) => g.player.id === guessedPlayer.id)) {
        return;
      }

      const evaluated = evaluateGuess(guessedPlayer);
      const nextGuesses = [...guesses, evaluated];
      setGuesses(nextGuesses);

      if (evaluated.isTarget) {
        hapticsService.success();
        setGameStatus('won');
        recordGameResult(true, nextGuesses.length);

        if (!isReplay) {
          addCoins(30);

          if (isDaily && dailyKey) {
            dailyStorage.saveSession(dailyKey, {
              dailyKey,
              status: 'won',
              guesses: nextGuesses,
              attemptsUsed: nextGuesses.length,
              completedAt: new Date().toISOString(),
            });
            markDailyCompleted(dailyKey);
          } else {
            unlockNextLevel(gameModeKey, leagueModeKey);
          }
        }

        onWin?.();
      } else if (nextGuesses.length >= maxAttempts) {
        hapticsService.error();
        setGameStatus('lost');
        recordGameResult(false, maxAttempts);

        if (isDaily && dailyKey) {
          dailyStorage.saveSession(dailyKey, {
            dailyKey,
            status: 'lost',
            guesses: nextGuesses,
            attemptsUsed: nextGuesses.length,
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
      evaluateGuess,
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
