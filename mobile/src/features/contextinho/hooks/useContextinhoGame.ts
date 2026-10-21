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
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
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

      let nextStatus: 'playing' | 'won' | 'lost' = 'playing';

      if (isCorrect) {
        nextStatus = 'won';
        setGameStatus('won');
        hapticsService.success();
        recordGameResult(true, nextGuesses.length);

        if (isDaily && dailyKey) {
          const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
          addCoins(45 + streakBonusCoins);
          addXp(90);
        } else if (!isReplay) {
          addCoins(35);
          addXp(60);
          unlockNextLevel('contextinho', leagueModeKey);
        }
      } else if (nextGuesses.length >= MAX_ATTEMPTS) {
        nextStatus = 'lost';
        setGameStatus('lost');
        hapticsService.error();
        recordGameResult(false, nextGuesses.length);

        if (isDaily && dailyKey) {
          markDailyCompleted(dailyKey, false);
        }
      } else if (finalEntry.tier === 'hot') {
        hapticsService.medium();
      } else {
        hapticsService.light();
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
      rankMap,
      targetPlayerId,
      targetPlayerName,
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
    setGameStatus('playing');
  }, []);

  return {
    guesses,
    lastGuess,
    gameStatus,
    isSearchModalVisible,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - guesses.length),
    maxAttempts: MAX_ATTEMPTS,
    openSearch,
    closeSearch,
    submitGuess,
    giveClosePlayerClue,
    resetGame,
  };
};
