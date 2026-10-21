import React, { useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IPlayerStatsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PlayerStatsModal: React.FC<IPlayerStatsModalProps> = React.memo(
  ({ visible, onClose }) => {
    const gamesPlayed = useGameStore((s) => s.gamesPlayed);
    const gamesWon = useGameStore((s) => s.gamesWon);
    const currentStreak = useGameStore((s) => s.currentStreak);
    const maxStreak = useGameStore((s) => s.maxStreak);
    const guessDistribution = useGameStore((s) => s.guessDistribution);

    const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
    const distValues = Object.values(guessDistribution);
    const maxDist = Math.max(1, ...distValues);

    const attemptsList = useMemo(() => {
      const attemptsWithWins = Object.entries(guessDistribution)
        .filter(([_, count]) => (count || 0) > 0)
        .map(([att]) => Number(att));
      const highestAttemptWithWin = attemptsWithWins.length > 0 ? Math.max(...attemptsWithWins) : 8;
      const maxRange = Math.min(12, Math.max(8, highestAttemptWithWin));
      return Array.from({ length: maxRange }, (_, i) => i + 1);
    }, [guessDistribution]);

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>📊 Oyuncu İstatistikleri</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* 4 KPI Cards */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiNumber}>{gamesPlayed}</Text>
                  <Text style={styles.kpiLabel}>Oynanan</Text>
                </View>

                <View style={styles.kpiCard}>
                  <Text style={styles.kpiNumber}>%{winRate}</Text>
                  <Text style={styles.kpiLabel}>Kazanma</Text>
                </View>

                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiNumber, styles.fireText]}>🔥 {currentStreak}</Text>
                  <Text style={styles.kpiLabel}>Güncel Seri</Text>
                </View>

                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiNumber, styles.starText]}>⭐ {maxStreak}</Text>
                  <Text style={styles.kpiLabel}>En İyi Seri</Text>
                </View>
              </View>

              {/* Streak Info Banner */}
              <View style={styles.streakBanner}>
                <Text style={styles.streakBannerEmoji}>🎁</Text>
                <View style={styles.streakBannerCol}>
                  <Text style={styles.streakBannerTitle}>Seri Ödülleri</Text>
                  <Text style={styles.streakBannerText}>
                    3 günlük seride +100🪙, 7 günlük seride +300🪙 ekstra ödül kazanırsınız!
                  </Text>
                </View>
              </View>

              {/* Guess Distribution */}
              <View style={styles.distSection}>
                <Text style={styles.distTitle}>Tahmin Dağılımı</Text>
                {attemptsList.map((attempt) => {
                  const count = guessDistribution[attempt] || 0;
                  const percentWidth = Math.max(10, Math.round((count / maxDist) * 100));

                  return (
                    <View key={attempt} style={styles.distRow}>
                      <Text style={styles.distNumber}>{attempt}</Text>
                      <View style={styles.distBarBg}>
                        <View
                          style={[
                            styles.distBarFill,
                            { width: `${percentWidth}%` },
                            count > 0 && styles.distBarFillActive,
                          ]}
                        >
                          <Text style={styles.distCountText}>{count}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.actionBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.actionBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

PlayerStatsModal.displayName = 'PlayerStatsModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeText: {
    fontSize: 18,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: Spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  fireText: {
    color: Colors.accent,
  },
  starText: {
    color: Colors.secondary,
  },
  kpiLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  streakBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  streakBannerEmoji: {
    fontSize: 26,
    marginRight: Spacing.sm,
  },
  streakBannerCol: {
    flex: 1,
  },
  streakBannerTitle: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 13,
  },
  streakBannerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  distSection: {
    marginBottom: Spacing.sm,
  },
  distTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distNumber: {
    width: 20,
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  distBarBg: {
    flex: 1,
    height: 22,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
    borderRadius: BorderRadius.sm,
  },
  distBarFillActive: {
    backgroundColor: Colors.primary,
  },
  distCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
  actionBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
});
