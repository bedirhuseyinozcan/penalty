import { useState, useCallback, useMemo, useEffect } from 'react';
import { ILightPlayer, searchEngine } from '../../../services/searchEngine';
import {
  generateTicTacToeBoard,
  doesPlayerMatchCriterion,
  getMatchingPlayersForCell,
} from '../utils/ticTacToeEngine';
import { ITicTacToeCellState } from '../types';
import { useGameStore } from '../../../stores/useGameStore';
import { hapticsService } from '../../../services/hapticsService';
import { dailyStorage } from '../../daily/utils/dailyStorage';

interface IUseTicTacToeGameProps {
  seedKey: string;
  leagueMode: 'global' | 'super_lig';
  isDaily?: boolean;
  isReplay?: boolean;
  dailyKey?: string;
}

const MAX_ATTEMPTS = 12;

export const useTicTacToeGame = ({
  seedKey,
  leagueMode,
  isDaily = false,
  isReplay = false,
  dailyKey = '',
}: IUseTicTacToeGameProps) => {
  const board = useMemo(() => {
    if (isDaily && dailyKey) {
      const frozen = dailyStorage.getFrozenSetup<import('../types').ITicTacToeBoardData>(dailyKey);
      if (frozen && frozen.rows && frozen.cols && frozen.cells) {
        return frozen;
      }
      const generated = generateTicTacToeBoard(seedKey, leagueMode);
      dailyStorage.saveFrozenSetup(dailyKey, generated);
      return generated;
    }
    return generateTicTacToeBoard(seedKey, leagueMode);
  }, [seedKey, leagueMode, isDaily, dailyKey]);

  const [cells, setCells] = useState<ITicTacToeCellState[]>(board.cells);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState<number>(0);
  const [extraAttempts, setExtraAttempts] = useState<number>(0);
  const [hasRevived, setHasRevived] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const effectiveMaxAttempts = MAX_ATTEMPTS + extraAttempts;

  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const unlockNextLevel = useGameStore((s) => s.unlockNextLevel);
  const markDailyCompleted = useGameStore((s) => s.markDailyCompleted);
  const clearDailyCompleted = useGameStore((s) => s.clearDailyCompleted);
  const recordGameResult = useGameStore((s) => s.recordGameResult);

  useEffect(() => {
    if (isDaily && dailyKey) {
      const saved = dailyStorage.getSession<ITicTacToeCellState>(dailyKey);
      if (saved && saved.guesses && saved.guesses.length === 9) {
        setCells(saved.guesses);
        setAttemptsUsed(saved.attemptsUsed);
        setGameStatus(saved.status);
        return;
      }
    }
    setCells(board.cells);
    setSelectedCellIndex(null);
    setAttemptsUsed(0);
    setExtraAttempts(0);
    setHasRevived(false);
    setGameStatus('playing');
    setLastFeedback(null);
  }, [board, isDaily, dailyKey]);

  const usedPlayerIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of cells) {
      if (c.guessedPlayer) set.add(c.guessedPlayer.id);
    }
    return set;
  }, [cells]);

  const handleSelectCell = useCallback(
    (cellIndex: number) => {
      if (gameStatus !== 'playing') return;
      if (cells[cellIndex]?.isFilled) return;
      hapticsService.selection();
      setSelectedCellIndex(cellIndex);
      setIsSearchModalVisible(true);
    },
    [gameStatus, cells]
  );

  const openGeneralSearch = useCallback(() => {
    if (gameStatus !== 'playing') return;
    hapticsService.selection();
    setSelectedCellIndex(null);
    setIsSearchModalVisible(true);
  }, [gameStatus]);

  const closeSearch = useCallback(() => {
    setIsSearchModalVisible(false);
  }, []);

  const submitCellGuess = useCallback(
    (player: ILightPlayer) => {
      if (gameStatus !== 'playing') return;

      if (usedPlayerIds.has(player.id)) {
        hapticsService.warning();
        setLastFeedback(`⚠️ ${player.name} zaten başka bir kutuda kullanıldı!`);
        closeSearch();
        return;
      }

      if (selectedCellIndex === null) {
        const emptyCells = cells.filter((c) => !c.isFilled);
        const matchingIndices = emptyCells
          .filter((c) => {
            const rowCrit = board.rows[c.row];
            const colCrit = board.cols[c.col];
            return (
              doesPlayerMatchCriterion(player, rowCrit) &&
              doesPlayerMatchCriterion(player, colCrit)
            );
          })
          .map((c) => c.cellIndex);

        const nextAttempts = attemptsUsed + 1;
        setAttemptsUsed(nextAttempts);
        closeSearch();

        if (matchingIndices.length > 0) {
          hapticsService.success();
          const nextCells = cells.map((c) => {
            if (matchingIndices.includes(c.cellIndex)) {
              const rarityLabel =
                c.possibleCount <= 6 ? '🦄 Nadir' : c.possibleCount <= 14 ? '⭐ Seçkin' : '🔥 Popüler';
              return { ...c, isFilled: true, guessedPlayer: player, rarityLabel };
            }
            return c;
          });
          setCells(nextCells);

          if (matchingIndices.length >= 2) {
            setLastFeedback(
              `🔥 SÜPER KOMBO! ${player.name} aynı anda ${matchingIndices.length} hücreyi birden doldurdu!`
            );
          } else {
            const matchedCell = cells[matchingIndices[0]];
            const rLabel = board.rows[matchedCell.row].label;
            const cLabel = board.cols[matchedCell.col].label;
            setLastFeedback(`✅ Harika! ${player.name} (${rLabel} × ${cLabel}) kutusuna yerleşti!`);
          }

          const allFilled = nextCells.every((c) => c.isFilled);
          if (allFilled) {
            setGameStatus('won');
            recordGameResult(true, nextAttempts);

            if (!isReplay) {
              if (isDaily && dailyKey) {
                const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
                addCoins(45 + streakBonusCoins);
                addXp(100);
                dailyStorage.saveSession(dailyKey, {
                  dailyKey,
                  status: 'won',
                  guesses: nextCells,
                  attemptsUsed: nextAttempts,
                  completedAt: new Date().toISOString(),
                });
              } else {
                addCoins(35);
                addXp(70);
                unlockNextLevel('ticTacToe', leagueMode);
              }
            }
          }
        } else {
          hapticsService.error();
          setLastFeedback(`❌ ${player.name} tahtadaki hiçbir açık kutu kriterine uymuyor.`);

          if (nextAttempts >= effectiveMaxAttempts) {
            setGameStatus('lost');
            if (hasRevived) {
              recordGameResult(false, nextAttempts);
              if (isDaily && dailyKey) {
                dailyStorage.saveSession(dailyKey, {
                  dailyKey,
                  status: 'lost',
                  guesses: cells,
                  attemptsUsed: nextAttempts,
                  completedAt: new Date().toISOString(),
                });
                markDailyCompleted(dailyKey, false);
              }
            }
          }
        }
        return;
      }

      const targetCell = cells[selectedCellIndex];
      const rowCrit = board.rows[targetCell.row];
      const colCrit = board.cols[targetCell.col];

      const isMatch =
        doesPlayerMatchCriterion(player, rowCrit) &&
        doesPlayerMatchCriterion(player, colCrit);

      const nextAttempts = attemptsUsed + 1;
      setAttemptsUsed(nextAttempts);
      closeSearch();

      if (isMatch) {
        hapticsService.success();
        const rarityLabel =
          targetCell.possibleCount <= 6 ? '🦄 Nadir' : targetCell.possibleCount <= 14 ? '⭐ Seçkin' : '🔥 Popüler';

        const nextCells = cells.map((c, idx) =>
          idx === selectedCellIndex
            ? { ...c, isFilled: true, guessedPlayer: player, rarityLabel }
            : c
        );
        setCells(nextCells);
        setLastFeedback(`✅ Doğru! ${player.name} (${rowCrit.label} × ${colCrit.label}) • [${rarityLabel}]`);

        const allFilled = nextCells.every((c) => c.isFilled);
        if (allFilled) {
          setGameStatus('won');
          recordGameResult(true, nextAttempts);

          if (!isReplay) {
            if (isDaily && dailyKey) {
              const { streakBonusCoins } = markDailyCompleted(dailyKey, true);
              addCoins(45 + streakBonusCoins);
              addXp(100);
              dailyStorage.saveSession(dailyKey, {
                dailyKey,
                status: 'won',
                guesses: nextCells,
                attemptsUsed: nextAttempts,
                completedAt: new Date().toISOString(),
              });
            } else {
              addCoins(35);
              addXp(70);
              unlockNextLevel('ticTacToe', leagueMode);
            }
          }
        }
      } else {
        hapticsService.error();
        setLastFeedback(
          `❌ Yanlış! ${player.name}, "${rowCrit.label} × ${colCrit.label}" kesişimine uymuyor.`
        );

        if (nextAttempts >= effectiveMaxAttempts) {
          setGameStatus('lost');
          if (hasRevived) {
            recordGameResult(false, nextAttempts);
            if (isDaily && dailyKey) {
              dailyStorage.saveSession(dailyKey, {
                dailyKey,
                status: 'lost',
                guesses: cells,
                attemptsUsed: nextAttempts,
                completedAt: new Date().toISOString(),
              });
              markDailyCompleted(dailyKey, false);
            }
          }
        }
      }
    },
    [
      gameStatus,
      selectedCellIndex,
      usedPlayerIds,
      cells,
      board,
      attemptsUsed,
      effectiveMaxAttempts,
      hasRevived,
      closeSearch,
      isReplay,
      isDaily,
      dailyKey,
      leagueMode,
      recordGameResult,
      markDailyCompleted,
      addCoins,
      addXp,
      unlockNextLevel,
    ]
  );

  const revealRandomCellWithHint = useCallback((): string => {
    const emptyCells = cells.filter((c) => !c.isFilled);
    if (emptyCells.length === 0) return 'Tüm kutular zaten dolu!';

    const targetCell = emptyCells[0];
    const rowCrit = board.rows[targetCell.row];
    const colCrit = board.cols[targetCell.col];
    const pool = searchEngine.getPlayersByLeagueMode(leagueMode, { includeLegends: true });
    const matches = getMatchingPlayersForCell(
      pool.length > 0 ? pool : searchEngine.getPlayersByLeagueMode(undefined, { includeLegends: true }),
      rowCrit,
      colCrit,
      usedPlayerIds
    );

    if (matches.length > 0) {
      const hintPlayer = matches[0];
      return `💡 İpucu (${rowCrit.label} × ${colCrit.label}): ${hintPlayer.name}`;
    }
    return `💡 İpucu: Önce köşe kutulardaki kulüp oyuncularını dene!`;
  }, [cells, board, leagueMode, usedPlayerIds]);

  const reviveGame = useCallback(() => {
    setHasRevived(true);
    setExtraAttempts((prev) => prev + 3);
    setGameStatus('playing');
    if (isDaily && dailyKey) {
      dailyStorage.deleteSession(dailyKey);
      clearDailyCompleted(dailyKey);
    }
  }, [isDaily, dailyKey, clearDailyCompleted]);

  const finalizeLoss = useCallback(() => {
    if (gameStatus === 'lost') {
      recordGameResult(false, attemptsUsed);
      if (isDaily && dailyKey) {
        dailyStorage.saveSession(dailyKey, {
          dailyKey,
          status: 'lost',
          guesses: cells,
          attemptsUsed,
          completedAt: new Date().toISOString(),
        });
        markDailyCompleted(dailyKey, false);
      }
    }
  }, [gameStatus, attemptsUsed, isDaily, dailyKey, cells, recordGameResult, markDailyCompleted]);

  const resetGame = useCallback(() => {
    setCells(board.cells);
    setSelectedCellIndex(null);
    setAttemptsUsed(0);
    setExtraAttempts(0);
    setHasRevived(false);
    setGameStatus('playing');
    setLastFeedback(null);
  }, [board]);

  const filledCount = useMemo(() => cells.filter((c) => c.isFilled).length, [cells]);

  return {
    rows: board.rows,
    cols: board.cols,
    cells,
    filledCount,
    selectedCellIndex,
    gameStatus,
    attemptsLeft: Math.max(0, effectiveMaxAttempts - attemptsUsed),
    attemptsUsed,
    maxAttempts: effectiveMaxAttempts,
    canRevive: !hasRevived,
    isSearchModalVisible,
    lastFeedback,
    handleSelectCell,
    openGeneralSearch,
    closeSearch,
    submitCellGuess,
    revealRandomCellWithHint,
    reviveGame,
    finalizeLoss,
    resetGame,
  };
};
