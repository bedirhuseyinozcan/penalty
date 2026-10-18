import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { useGameStore } from '../stores/useGameStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface ILevelMapScreenProps {
  gameMode: 'whoAreYa' | 'careerPath';
  onSelectLevel: (levelNumber: number, isReplay: boolean) => void;
  onBack: () => void;
}

const TOTAL_LEVELS = 50;

export const LevelMapScreen: React.FC<ILevelMapScreenProps> = React.memo(
  ({ gameMode, onSelectLevel, onBack }) => {
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

    const levels = useMemo(() => {
      const maxLevel = Math.max(TOTAL_LEVELS, unlockedLevel + 5);
      return Array.from({ length: maxLevel }, (_, i) => i + 1);
    }, [unlockedLevel]);

    const handleLevelPress = (lvl: number) => {
      if (lvl > unlockedLevel) {
        setLockedAlertLevel(lvl);
      } else if (lvl < unlockedLevel) {
        setReplayConfirmLevel(lvl);
      } else {
        onSelectLevel(lvl, false);
      }
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

        {/* Top Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>‹ Ana Menü</Text>
          </TouchableOpacity>

          <View style={styles.navCurrency}>
            <View style={styles.coinBadge}>
              <Text style={styles.coinText}>🪙 {coins}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>⚡ {xp} XP</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Banner */}
          <View style={styles.headerCard}>
            <View style={styles.titleRow}>
              <Text style={styles.titleEmoji}>{gameEmoji}</Text>
              <View style={styles.titleCol}>
                <Text style={styles.gameTitle}>{gameTitle}</Text>
                <Text style={styles.leagueText}>{leagueLabel} • Yol Haritası</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressLabel}>İlerleme Durumu</Text>
                <Text style={styles.progressVal}>
                  {completedCount} / {TOTAL_LEVELS} Seviye (%{progressPercent})
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </View>

          {/* Map Grid */}
          <View style={styles.gridContainer}>
            {levels.map((lvl) => {
              const isCompleted = lvl < unlockedLevel;
              const isCurrent = lvl === unlockedLevel;
              const isLocked = lvl > unlockedLevel;

              return (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.levelCard,
                    isCompleted && styles.completedCard,
                    isCurrent && styles.currentCard,
                    isLocked && styles.lockedCard,
                  ]}
                  activeOpacity={isLocked ? 0.9 : 0.7}
                  onPress={() => handleLevelPress(lvl)}
                >
                  {/* Status Indicator */}
                  <View style={styles.cardHeader}>
                    {isCompleted ? (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedIcon}>✅</Text>
                      </View>
                    ) : isCurrent ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentIcon}>⭐</Text>
                      </View>
                    ) : (
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedIcon}>🔒</Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.levelNumber,
                      isCompleted && styles.completedNumber,
                      isCurrent && styles.currentNumber,
                      isLocked && styles.lockedNumber,
                    ]}
                  >
                    {lvl}
                  </Text>

                  <Text
                    style={[
                      styles.levelStatusText,
                      isCompleted && styles.completedStatusText,
                      isCurrent && styles.currentStatusText,
                      isLocked && styles.lockedStatusText,
                    ]}
                  >
                    {isCompleted ? 'Geçildi' : isCurrent ? 'Oyna ▶' : 'Kilitli'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Replay Confirmation Modal */}
        <Modal
          visible={replayConfirmLevel !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setReplayConfirmLevel(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🔁</Text>
              <Text style={styles.modalTitle}>Seviye Zaten Tamamlandı</Text>
              <Text style={styles.modalSubtitle}>
                Seviye {replayConfirmLevel}'i daha önce başarıyla tamamladınız. Tekrar oynamak
                istiyor musunuz?
              </Text>
              <View style={styles.modalNoticeBox}>
                <Text style={styles.modalNoticeText}>
                  ⚠️ Not: Bu seviye daha önce geçildiği için tekrar tamamlandığında yeni altın ödülü
                  verilmeyecektir.
                </Text>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setReplayConfirmLevel(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelBtnText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    const l = replayConfirmLevel;
                    setReplayConfirmLevel(null);
                    if (l != null) onSelectLevel(l, true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalConfirmBtnText}>Evet, Tekrar Oyna</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Locked Alert Modal */}
        <Modal
          visible={lockedAlertLevel !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setLockedAlertLevel(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🔒</Text>
              <Text style={styles.modalTitle}>Seviye Henüz Kilitli</Text>
              <Text style={styles.modalSubtitle}>
                Seviye {lockedAlertLevel}'e geçebilmek için lütfen önce Seviye {unlockedLevel}'i
                tamamlayınız.
              </Text>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { width: '100%', marginTop: Spacing.md }]}
                onPress={() => setLockedAlertLevel(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Anladım</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
);

LevelMapScreen.displayName = 'LevelMapScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingVertical: Spacing.xs,
  },
  backBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 16,
  },
  navCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  coinBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  coinText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  xpBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  xpText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleEmoji: {
    fontSize: 34,
    marginRight: Spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  gameTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  leagueText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: Spacing.xs,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressVal: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  levelCard: {
    width: '23%',
    aspectRatio: 0.9,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  completedCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: '#22C55E',
  },
  currentCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  lockedCard: {
    backgroundColor: Colors.surfaceLight,
    borderColor: 'transparent',
    opacity: 0.55,
  },
  cardHeader: {
    marginBottom: 2,
  },
  completedBadge: {},
  completedIcon: {
    fontSize: 14,
  },
  currentBadge: {},
  currentIcon: {
    fontSize: 14,
  },
  lockedBadge: {},
  lockedIcon: {
    fontSize: 14,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  completedNumber: {
    color: '#22C55E',
  },
  currentNumber: {
    color: '#10B981',
  },
  lockedNumber: {
    color: Colors.textMuted,
  },
  levelStatusText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  completedStatusText: {
    color: '#22C55E',
  },
  currentStatusText: {
    color: '#10B981',
  },
  lockedStatusText: {
    color: Colors.textMuted,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalNoticeBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  modalNoticeText: {
    ...Typography.caption,
    color: Colors.accent,
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelBtnText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
});
