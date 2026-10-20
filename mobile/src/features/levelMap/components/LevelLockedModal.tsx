import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ILevelLockedModalProps {
  lockedLevel: number | null;
  unlockedLevel: number;
  onDismiss: () => void;
}

export const LevelLockedModal: React.FC<ILevelLockedModalProps> = React.memo(
  ({ lockedLevel, unlockedLevel, onDismiss }) => {
    return (
      <Modal
        visible={lockedLevel !== null}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🔒</Text>
            <Text style={styles.modalTitle}>Seviye Henüz Kilitli</Text>
            <Text style={styles.modalSubtitle}>
              Seviye {lockedLevel}'e geçebilmek için lütfen önce Seviye {unlockedLevel}'i
              tamamlayınız.
            </Text>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Anladım</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

LevelLockedModal.displayName = 'LevelLockedModal';

const styles = StyleSheet.create({
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
  confirmBtn: {
    width: '100%',
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
});
