import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ILightPlayer, searchEngine } from '../../../services/searchEngine';
import { useFeedbackAnimation } from '../../../hooks/useFeedbackAnimation';
import { PlayerAvatar } from '../../../components/common/PlayerAvatar';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IBingoCurrentPlayerCardProps {
  player: ILightPlayer | null;
  playersLeftInDeck: number;
  totalDeckSize: number;
  matchedCount: number;
  totalTilesCount: number;
  feedbackBanner: {
    type: 'success' | 'penalty' | 'skip';
    message: string;
  } | null;
  onSkip: () => void;
  disabled?: boolean;
}

export const BingoCurrentPlayerCard: React.FC<IBingoCurrentPlayerCardProps> = React.memo(
  ({
    player,
    playersLeftInDeck,
    totalDeckSize,
    matchedCount,
    totalTilesCount,
    feedbackBanner,
    onSkip,
    disabled = false,
  }) => {
    const { animatedStyle, triggerShake, triggerPulse } = useFeedbackAnimation();

    useEffect(() => {
      if (!feedbackBanner) return;
      if (feedbackBanner.type === 'penalty') {
        triggerShake();
      } else if (feedbackBanner.type === 'success') {
        triggerPulse();
      }
    }, [feedbackBanner, triggerShake, triggerPulse]);

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.topStatsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>
              🃏 Deste: <Text style={styles.statPillHighlight}>{playersLeftInDeck}/{totalDeckSize}</Text>
            </Text>
          </View>

          <View style={[styles.statPill, styles.matchedPill]}>
            <Text style={styles.statPillText}>
              🎯 Bingo: <Text style={styles.matchedHighlight}>{matchedCount}/{totalTilesCount}</Text>
            </Text>
          </View>
        </View>

        {feedbackBanner && (
          <View
            style={[
              styles.feedbackBox,
              feedbackBanner.type === 'success' && styles.feedbackSuccess,
              feedbackBanner.type === 'penalty' && styles.feedbackPenalty,
              feedbackBanner.type === 'skip' && styles.feedbackSkip,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                feedbackBanner.type === 'success' && styles.feedbackSuccessText,
                feedbackBanner.type === 'penalty' && styles.feedbackPenaltyText,
                feedbackBanner.type === 'skip' && styles.feedbackSkipText,
              ]}
              numberOfLines={2}
            >
              {feedbackBanner.message}
            </Text>
          </View>
        )}
        {player ? (
          <Animated.View style={[styles.playerCard, player.isLegend && styles.legendCard, animatedStyle]}>
            <View style={styles.playerMainRow}>
              <PlayerAvatar
                key={player.id}
                imageUrl={searchEngine.getPlayerPhoto(player)}
                name={player.name}
                isLegend={player.isLegend}
                size={48}
                style={{ marginRight: Spacing.sm }}
              />

              <View style={styles.playerInfoCol}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {player.name}
                </Text>
                {player.isLegend ? (
                  <Text style={styles.legendBadge} numberOfLines={1}>
                    👑 Efsane İkon
                  </Text>
                ) : null}
                <Text style={styles.playerInstruction} numberOfLines={1}>
                  Uygun kutuya yerleştir veya pas geç
                </Text>
              </View>

              <TouchableOpacity
                style={styles.skipBtn}
                activeOpacity={0.8}
                onPress={onSkip}
                disabled={disabled}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.skipBtnText}>Pas Geç</Text>
                <Text style={styles.skipSub}>⏭️ -1</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.deckEmptyBox}>
            <Text style={styles.deckEmptyText}>Destedeki tüm oyuncular tamamlandı!</Text>
          </View>
        )}
      </View>
    );
  }
);

BingoCurrentPlayerCard.displayName = 'BingoCurrentPlayerCard';

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  topStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  statPill: {
    backgroundColor: Colors.surface,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchedPill: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  statPillText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  statPillHighlight: {
    color: Colors.accent,
    fontWeight: '700',
  },
  matchedHighlight: {
    color: Colors.success,
    fontWeight: '700',
  },
  feedbackBox: {
    borderRadius: BorderRadius.md,
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: Colors.success,
  },
  feedbackPenalty: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444',
  },
  feedbackSkip: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: Colors.primary,
  },
  feedbackText: {
    ...Typography.captionBold,
    fontSize: 11,
    textAlign: 'center',
  },
  feedbackSuccessText: {
    color: Colors.success,
  },
  feedbackPenaltyText: {
    color: '#EF4444',
  },
  feedbackSkipText: {
    color: Colors.primary,
  },
  playerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendCard: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  legendBadge: {
    ...Typography.captionBold,
    color: Colors.accent,
    fontSize: 11,
    marginTop: 1,
  },
  playerInfoCol: {
    flex: 1,
  },
  playerName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  playerInstruction: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  skipBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 42,
    minWidth: 56,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  skipBtnText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 11,
  },
  skipSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  deckEmptyBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  deckEmptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
