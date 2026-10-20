import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ILevelReplayModalProps {
  levelNumber: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LevelReplayModal: React.FC<ILevelReplayModalProps> = React.memo(
  ({ levelNumber, onConfirm, onCancel }) => {
    return (
      <Modal
        visible={levelNumber !== null}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🔁</Text>
            <Text style={styles.modalTitle}>Seviye Zaten Tamamlandı</Text>
            <Text style={styles.modalSubtitle}>
              Seviye {levelNumber}'i daha önce başarıyla tamamladınız. Tekrar oynamak istiyor
              musunuz?
            </Text>

            <View style={styles.modalNoticeBox}>
              <Text style={styles.modalNoticeText}>
                ⚠️ Not: Bu seviye daha önce geçildiği için tekrar tamamlandığında yeni altın ödülü
                verilmeyecektir.
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={onCancel} activeOpacity={0.8}>
                <Text style={styles.modalCancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Evet, Tekrar Oyna</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

LevelReplayModal.displayName = 'LevelReplayModal';

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
