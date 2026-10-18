import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.card}>
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
          </View>
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
    marginBottom: Spacing.md,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  playerName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  clubName: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  statsBox: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statsText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  rewardText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    marginTop: Spacing.xs,
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
  },
  primaryBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  mapBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBtnText: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  secondaryBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
