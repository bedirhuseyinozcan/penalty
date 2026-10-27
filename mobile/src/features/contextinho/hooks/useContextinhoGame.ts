import { useState, useCallback, useEffect, useMemo } from 'react';
import { ILightPlayer } from '../../../services/searchEngine';
import { useGameStore } from '../../../stores/useGameStore';
import { hapticsService } from '../../../services/hapticsService';
import { dailyStorage } from '../../daily/utils/dailyStorage';
import {
  buildContextinhoRankMap,
  IContextinhoRankedEntry,
} from '../utils/contextinhoEngine';

interface IUseContextinhoGameProps {
  targetPlayerId: string;
  targetPlayerName?: string;
  isDaily?: boolean;
  isReplay?: boolean;
  dailyKey?: string;
  leagueModeKey: 'global' | 'super_lig';
}

const MAX_ATTEMPTS = 12;

export const useContextinhoGame = ({
  targetPlayerId,
  targetPlayerName,
  isDaily = false,
  isReplay = false,
  dailyKey = '',
  leagueModeKey,
}: IUseContextinhoGameProps) => {
  const [guesses, setGuesses] = useState<IContextinhoRankedEntry[]>([]);
  const [lastGuess, setLastGuess] = useState<IContextinhoRankedEntry | null>(null);
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

  const rankMap = useMemo(
    () => buildContextinhoRankMap(targetPlayerId, targetPlayerName, leagueModeKey),
    [targetPlayerId, targetPlayerName, leagueModeKey]
  );

  useEffect(() => {
    if (isDaily && dailyKey) {
      const saved = dailyStorage.getSession<IContextinhoRankedEntry>(dailyKey);
      if (saved && saved.guesses && saved.guesses.length > 0) {
        setGuesses(saved.guesses);
        setLastGuess(saved.guesses[0] || null);
        setGameStatus(saved.status);
        return;
      }
    }
    setGuesses([]);
    setLastGuess(null);
    setExtraAttempts(0);
    setHasRevived(false);
    setGameStatus('playing');
  }, [targetPlayerId, isDaily, dailyKey]);

  const openSearch = useCallback(() => {
    if (gameStatus === 'playing') {
      hapticsService.light();
      setIsSearchModalVisible(true);
    }
  }, [gameStatus]);

  const closeSearch = useCallback(() => {
    setIsSearchModalVisible(false);
  }, []);

  const submitGuess = useCallback(
    (guessedPlayer: ILightPlayer) => {
      if (gameStatus !== 'playing') return;

      if (guesses.some((g) => g.player.id === guessedPlayer.id)) {
        closeSearch();
        return;
      }

      const rankedEntry: IContextinhoRankedEntry = rankMap.get(guessedPlayer.id) || {
        player: guessedPlayer,
        rank: 350,
        totalPool: Math.max(500, rankMap.size),
        heatPercent: 20,
        tier: 'cold',
        sharedTags: [],
      };

      const isCorrect =
        rankedEntry.rank === 1 ||
        guessedPlayer.id === targetPlayerId ||
        (targetPlayerName != null &&
          guessedPlayer.name.toLowerCase().trim() === targetPlayerName.toLowerCase().trim());

      const finalEntry: IContextinhoRankedEntry = isCorrect
        ? {
            ...rankedEntry,
            rank: 1,
            heatPercent: 100,
            tier: 'win',
            sharedTags: ['Hedef Yıldız 🎯'],
          }
        : rankedEntry;

      const nextGuesses = [...guesses, finalEntry].sort((a, b) => a.rank - b.rank);
      setGuesses(nextGuesses);
      setLastGuess(finalEntry);
      closeSearch();

      if (isCorrect) {
        setGameStatus('won');
        hapticsService.success();
        recordGameResult(true, nextGuesses.length);

        if (isDaily && dailyKey) {
          const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
          addCoins(35 + streakBonusCoins);
          addXp(80);
          dailyStorage.saveSession(dailyKey, {
            dailyKey,
            guesses: nextGuesses,
            status: 'won',
            attemptsUsed: nextGuesses.length,
            completedAt: new Date().toISOString(),
          });
        } else if (!isReplay) {
          addCoins(25);
          addXp(50);
          unlockNextLevel('contextinho', leagueModeKey);
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
      } else if (finalEntry.tier === 'hot') {
        hapticsService.medium();
      } else {
        hapticsService.light();
      }
    },
    [
      gameStatus,
      guesses,
      rankMap,
      targetPlayerId,
      targetPlayerName,
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

  const giveClosePlayerClue = useCallback((): string => {
    const entries = Array.from(rankMap.values()).sort((a, b) => a.rank - b.rank);
    const bestRankSoFar = guesses.length > 0 ? guesses[0].rank : 80;
    const targetRank = Math.max(2, Math.min(25, Math.floor(bestRankSoFar / 2)));
    const candidate =
      entries.find(
        (e) => e.rank >= targetRank && e.rank > 1 && !guesses.some((g) => g.player.id === e.player.id)
      ) || entries[1];

    if (candidate) {
      return `İpucu Açıldı: #${candidate.rank} sırada çok yakın bir isim — ${candidate.player.name} (${candidate.player.club})`;
    }
    return 'İpucu Açıldı: Hedef yıldız aynı ligin üst sıra takımlarından birinde!';
  }, [rankMap, guesses]);

  const resetGame = useCallback(() => {
    setGuesses([]);
    setLastGuess(null);
    setExtraAttempts(0);
    setHasRevived(false);
    setGameStatus('playing');
  }, []);

  return {
    guesses,
    lastGuess,
    gameStatus,
    isSearchModalVisible,
    attemptsLeft: Math.max(0, effectiveMaxAttempts - guesses.length),
    maxAttempts: effectiveMaxAttempts,
    canRevive: !hasRevived,
    openSearch,
    closeSearch,
    submitGuess,
    giveClosePlayerClue,
    reviveGame,
    finalizeLoss,
    resetGame,
  };
};
