import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IWhoAreYaWinModalProps {
  visible: boolean;
  status: 'won' | 'lost';
  playerName: string;
  playerClub: string;
  finalImageUrl?: string;
  rewardCoins?: number;
  attemptsUsed: number;
  maxAttempts: number;
  onNextLevel?: () => void;
  onOpenMap?: () => void;
  onClose: () => void;
}

export const WhoAreYaWinModal: React.FC<IWhoAreYaWinModalProps> = React.memo(
  ({
    visible,
    status,
    playerName,
    playerClub,
    finalImageUrl,
    rewardCoins = 30,
    attemptsUsed,
    maxAttempts,
    onNextLevel,
    onOpenMap,
    onClose,
  }) => {
    const isWon = status === 'won';
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        scaleAnim.setValue(0.85);
        opacityAnim.setValue(0);
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 55,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, scaleAnim, opacityAnim]);

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.titleIcon}>{isWon ? '🏆' : '💔'}</Text>
            <Text style={styles.title}>{isWon ? 'TEBRİKLER!' : 'MAALESEF BİLEMEDİNİZ'}</Text>
            {finalImageUrl ? (
              <Image source={{ uri: finalImageUrl }} style={styles.image} resizeMode="cover" />
            ) : null}

            <Text style={styles.playerName}>{playerName}</Text>
            <Text style={styles.clubName}>{playerClub}</Text>

            <View style={styles.statsBox}>
              <Text style={styles.statsText}>
                {isWon
                  ? `${attemptsUsed}/${maxAttempts} tahminde bildiniz!`
                  : `Tüm haklarınızı (${maxAttempts}/${maxAttempts}) kullandınız.`}
              </Text>
              {isWon && (
                <Text style={styles.rewardText}>
                  {rewardCoins > 0 ? `+${rewardCoins} Altın Kazandınız 🪙` : '⭐ Seviye Tekrarı (Ödül Yok)'}
                </Text>
              )}
            </View>

            <View style={styles.buttonRow}>
              {onNextLevel && isWon ? (
                <TouchableOpacity style={styles.primaryBtn} onPress={onNextLevel} activeOpacity={0.8}>
                  <Text style={styles.primaryBtnText}>Sonraki Seviye ⏩</Text>
                </TouchableOpacity>
              ) : null}

              {onOpenMap ? (
                <TouchableOpacity style={styles.mapBtn} onPress={onOpenMap} activeOpacity={0.8}>
                  <Text style={styles.mapBtnText}>🗺️ Harita</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.secondaryBtnText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

WhoAreYaWinModal.displayName = 'WhoAreYaWinModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleIcon: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceLight,
  },
  playerName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  clubName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  statsBox: {
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  rewardText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  mapBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    width: '100%',
  },
  secondaryBtnText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
