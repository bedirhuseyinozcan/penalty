import { useState, useMemo, useCallback } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { hapticsService } from '../../../services/hapticsService';
import { ILevelItem, LevelStatus } from '../types';

export const TOTAL_LEVELS = 50;

interface IUseLevelMapProps {
  gameMode: 'whoAreYa' | 'careerPath';
  onSelectLevel: (levelNumber: number, isReplay: boolean) => void;
}

export const useLevelMap = ({ gameMode, onSelectLevel }: IUseLevelMapProps) => {
  const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);
  const getUnlockedLevel = useGameStore((s) => s.getUnlockedLevel);
  const coins = useGameStore((s) => s.coins);
  const xp = useGameStore((s) => s.xp);

  const [replayConfirmLevel, setReplayConfirmLevel] = useState<number | null>(null);
  const [lockedAlertLevel, setLockedAlertLevel] = useState<number | null>(null);

  const unlockedLevel = useMemo(() => {
    return getUnlockedLevel(gameMode, selectedLeagueMode);
  }, [gameMode, selectedLeagueMode, getUnlockedLevel]);

  const isSuperLig = selectedLeagueMode === 'super_lig';
  const isWhoAreYa = gameMode === 'whoAreYa';

  const gameTitle = isWhoAreYa ? 'Kim Bu Yıldız?' : 'Transfer Rotası';
  const gameEmoji = isWhoAreYa ? '🕵️‍♂️' : '🧭';
  const leagueLabel = isSuperLig ? '🇹🇷 Süper Lig' : '🌍 5 Büyük Lig (Global)';

  const completedCount = Math.max(0, unlockedLevel - 1);
  const progressPercent = Math.min(100, Math.round((completedCount / TOTAL_LEVELS) * 100));

  const levels: ILevelItem[] = useMemo(() => {
    const maxLevel = Math.max(TOTAL_LEVELS, unlockedLevel + 5);
    return Array.from({ length: maxLevel }, (_, i) => {
      const lvl = i + 1;
      let status: LevelStatus = 'locked';
      if (lvl < unlockedLevel) status = 'completed';
      else if (lvl === unlockedLevel) status = 'current';

      return {
        levelNumber: lvl,
        status,
      };
    });
  }, [unlockedLevel]);

  const handleLevelPress = useCallback(
    (lvl: number) => {
      if (lvl > unlockedLevel) {
        hapticsService.error();
        setLockedAlertLevel(lvl);
      } else if (lvl < unlockedLevel) {
        hapticsService.light();
        setReplayConfirmLevel(lvl);
      } else {
        hapticsService.medium();
        onSelectLevel(lvl, false);
      }
    },
    [unlockedLevel, onSelectLevel]
  );

  const confirmReplay = useCallback(() => {
    if (replayConfirmLevel != null) {
      const target = replayConfirmLevel;
      setReplayConfirmLevel(null);
      onSelectLevel(target, true);
    }
  }, [replayConfirmLevel, onSelectLevel]);

  const cancelReplay = useCallback(() => {
    setReplayConfirmLevel(null);
  }, []);

  const dismissLockedAlert = useCallback(() => {
    setLockedAlertLevel(null);
  }, []);

  return {
    coins,
    xp,
    unlockedLevel,
    completedCount,
    progressPercent,
    levels,
    gameTitle,
    gameEmoji,
    leagueLabel,
    replayConfirmLevel,
    lockedAlertLevel,
    handleLevelPress,
    confirmReplay,
    cancelReplay,
    dismissLockedAlert,
  };
};
