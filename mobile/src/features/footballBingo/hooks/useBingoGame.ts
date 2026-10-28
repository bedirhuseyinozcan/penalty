import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  generateBingoSetup,
  doesPlayerMatchBingoTile,
  BINGO_DECK_SIZE,
  BINGO_GRID_SIZE,
} from '../utils/bingoEngine';
import { IBingoTile } from '../types';
import { useGameStore } from '../../../stores/useGameStore';
import { hapticsService } from '../../../services/hapticsService';
import { dailyStorage } from '../../daily/utils/dailyStorage';

interface IUseBingoGameProps {
  seedKey: string;
  leagueMode: 'global' | 'super_lig';
  isDaily?: boolean;
  isReplay?: boolean;
  dailyKey?: string;
}

export const useBingoGame = ({
  seedKey,
  leagueMode,
  isDaily = false,
  isReplay = false,
  dailyKey = '',
}: IUseBingoGameProps) => {
  const setup = useMemo(() => {
    if (isDaily && dailyKey) {
      const frozen = dailyStorage.getFrozenSetup<ReturnType<typeof generateBingoSetup>>(dailyKey);
      if (frozen && frozen.tiles && frozen.deck) {
        return frozen;
      }
      const generated = generateBingoSetup(seedKey, leagueMode);
      dailyStorage.saveFrozenSetup(dailyKey, generated);
      return generated;
    }
    return generateBingoSetup(seedKey, leagueMode);
  }, [seedKey, leagueMode, isDaily, dailyKey]);

  const [tiles, setTiles] = useState<IBingoTile[]>(setup.tiles);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [wrongFlashTileIndex, setWrongFlashTileIndex] = useState<number | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'penalty' | 'skip';
    message: string;
  } | null>(null);
  const [hasRevived, setHasRevived] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
  const clearDailyCompleted = useGameStore((s) => s.clearDailyCompleted);
  const recordGameResult = useGameStore((s) => s.recordGameResult);

  useEffect(() => {
    if (isDaily && dailyKey) {
      const saved = dailyStorage.getSession<IBingoTile>(dailyKey);
      if (saved && saved.guesses && saved.guesses.length === BINGO_GRID_SIZE) {
        setTiles(saved.guesses);
        setCurrentIndex(saved.attemptsUsed);
        setGameStatus(saved.status);
        return;
      }
    }
    setTiles(setup.tiles);
    setCurrentIndex(0);
    setMistakesCount(0);
    setWrongFlashTileIndex(null);
    setFeedbackBanner(null);
    setHasRevived(false);
    setGameStatus('playing');
  }, [setup, isDaily, dailyKey]);

  const currentPlayer = useMemo(() => {
    if (currentIndex >= setup.deck.length) return null;
    return setup.deck[currentIndex];
  }, [setup.deck, currentIndex]);

  const matchedCount = useMemo(
    () => tiles.filter((t) => t.isMatched).length,
    [tiles]
  );

  const playersLeftInDeck = Math.max(0, setup.deck.length - currentIndex);

  const advanceDeck = useCallback(
    (step: number, updatedTiles: IBingoTile[]) => {
      const nextIdx = currentIndex + step;
      const allMatched = updatedTiles.every((t) => t.isMatched);

      if (allMatched) {
        setCurrentIndex(Math.min(nextIdx, setup.deck.length));
        setGameStatus('won');
        recordGameResult(true, Math.min(12, Math.max(1, mistakesCount + 1)));

        if (!isReplay) {
          if (isDaily && dailyKey) {
            const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
            addCoins(50 + streakBonusCoins);
            addXp(110);
            dailyStorage.saveSession(dailyKey, {
              dailyKey,
              status: 'won',
              guesses: updatedTiles,
              attemptsUsed: nextIdx,
              completedAt: new Date().toISOString(),
            });
          } else {
            addCoins(40);
            addXp(80);
            unlockNextLevel('footballBingo', leagueMode);
          }
        }
        return;
      }

      if (nextIdx >= setup.deck.length) {
        setCurrentIndex(setup.deck.length);
        setGameStatus('lost');
        if (hasRevived) {
          recordGameResult(false, BINGO_DECK_SIZE);
          if (isDaily && dailyKey) {
            dailyStorage.saveSession(dailyKey, {
              dailyKey,
              status: 'lost',
              guesses: updatedTiles,
              attemptsUsed: setup.deck.length,
              completedAt: new Date().toISOString(),
            });
            markDailyCompleted(dailyKey, false);
          }
        }
      } else {
        setCurrentIndex(nextIdx);
      }
    },
    [
      currentIndex,
      setup.deck.length,
      mistakesCount,
      isReplay,
      isDaily,
      dailyKey,
      leagueMode,
      hasRevived,
      recordGameResult,
      markDailyCompleted,
      addCoins,
      addXp,
      unlockNextLevel,
    ]
  );

  // Kutu Seçimi (Doğruysa +1 ilerler, Yanlışsa CEZA olarak +2 ilerler!)
  const handleSelectTile = useCallback(
    (tileIndex: number) => {
      if (gameStatus !== 'playing' || !currentPlayer) return;

      const targetTile = tiles[tileIndex];
      if (!targetTile || targetTile.isMatched) return;

      const isMatch = doesPlayerMatchBingoTile(currentPlayer, targetTile);

      if (isMatch) {
        hapticsService.success();
        setWrongFlashTileIndex(null);
        const nextTiles = tiles.map((t, idx) =>
          idx === tileIndex
            ? { ...t, isMatched: true, matchedPlayer: currentPlayer }
            : t
        );
        setTiles(nextTiles);
        setFeedbackBanner({
          type: 'success',
          message: `✅ ${currentPlayer.name} → ${targetTile.title} eşleşti!`,
        });
        advanceDeck(1, nextTiles);
      } else {
        hapticsService.error();
        setMistakesCount((prev) => prev + 1);
        setWrongFlashTileIndex(tileIndex);

        const skippedExtraPlayer = setup.deck[currentIndex + 1];
        const skippedMsg = skippedExtraPlayer
          ? `Ceza olarak sıradaki "${skippedExtraPlayer.name}" da atlandı! (-2 Deste)`
          : 'Destedeki son haklar yandı!';

        setFeedbackBanner({
          type: 'penalty',
          message: `❌ Yanlış Kutu! ${skippedMsg}`,
        });

        advanceDeck(2, tiles);
      }
    },
    [gameStatus, currentPlayer, tiles, setup.deck, currentIndex, advanceDeck]
  );

  const handleSkipPlayer = useCallback(() => {
    if (gameStatus !== 'playing' || !currentPlayer) return;
    hapticsService.light();
    setWrongFlashTileIndex(null);
    setFeedbackBanner({
      type: 'skip',
      message: `⏭️ ${currentPlayer.name} pas geçildi. (-1 Deste)`,
    });
    advanceDeck(1, tiles);
  }, [gameStatus, currentPlayer, advanceDeck, tiles]);

  const autoMatchOneTileHint = useCallback((): string => {
    if (!currentPlayer) return 'Deste bitti!';
    const matchingUnfilled = tiles.find(
      (t) => !t.isMatched && doesPlayerMatchBingoTile(currentPlayer, t)
    );

    if (matchingUnfilled) {
      return `💡 İpucu: ${currentPlayer.name} doğrudan "${matchingUnfilled.title}" kutusuna uyuyor!`;
    }
    return `💡 İpucu: ${currentPlayer.name} şu anki boş kutulara uymuyor, "Pas Geç" butonunu kullan!`;
  }, [currentPlayer, tiles]);

  const reviveGame = useCallback(() => {
    setHasRevived(true);
    setCurrentIndex((prev) => Math.max(0, prev - 6));
    setGameStatus('playing');
    setFeedbackBanner({
      type: 'success',
      message: '🔥 +6 Ekstra Futbolcu Desteğe Eklendi! Devam et!',
    });
    if (isDaily && dailyKey) {
      dailyStorage.deleteSession(dailyKey);
      clearDailyCompleted(dailyKey);
    }
  }, [isDaily, dailyKey, clearDailyCompleted]);

  const finalizeLoss = useCallback(() => {
    if (gameStatus === 'lost') {
      recordGameResult(false, BINGO_DECK_SIZE);
      if (isDaily && dailyKey) {
        dailyStorage.saveSession(dailyKey, {
          dailyKey,
          status: 'lost',
          guesses: tiles,
          attemptsUsed: setup.deck.length,
          completedAt: new Date().toISOString(),
        });
        markDailyCompleted(dailyKey, false);
      }
    }
  }, [gameStatus, isDaily, dailyKey, tiles, setup.deck.length, recordGameResult, markDailyCompleted]);

  const resetGame = useCallback(() => {
    setTiles(setup.tiles);
    setCurrentIndex(0);
    setMistakesCount(0);
    setWrongFlashTileIndex(null);
    setFeedbackBanner(null);
    setHasRevived(false);
    setGameStatus('playing');
  }, [setup]);

  return {
    tiles,
    currentPlayer,
    currentIndex,
    totalDeckSize: BINGO_DECK_SIZE,
    playersLeftInDeck,
    matchedCount,
    totalTilesCount: BINGO_GRID_SIZE,
    mistakesCount,
    wrongFlashTileIndex,
    feedbackBanner,
    gameStatus,
    canRevive: !hasRevived,
    handleSelectTile,
    handleSkipPlayer,
    autoMatchOneTileHint,
    reviveGame,
    finalizeLoss,
    resetGame,
  };
};
