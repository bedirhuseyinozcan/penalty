import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useOfflinePlayerSearch } from '../hooks/useOfflinePlayerSearch';
import { PlayerSearchItem } from './PlayerSearchItem';
import { ILightPlayer } from '../../../services/searchEngine';
import { hapticsService } from '../../../services/hapticsService';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IOfflinePlayerSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlayer: (player: ILightPlayer) => void;
}

export const OfflinePlayerSearchModal: React.FC<IOfflinePlayerSearchModalProps> = React.memo(
  ({ visible, onClose, onSelectPlayer }) => {
    const { query, results, handleQueryChange, clearSearch } = useOfflinePlayerSearch();

    const handleSelect = useCallback(
      (player: ILightPlayer) => {
        hapticsService.selection();
        clearSearch();
        onSelectPlayer(player);
        onClose();
      },
      [clearSearch, onSelectPlayer, onClose]
    );

    const handleClose = useCallback(() => {
      clearSearch();
      onClose();
    }, [clearSearch, onClose]);

    const renderItem = useCallback(
      ({ item }: { item: ILightPlayer }) => (
        <PlayerSearchItem player={item} onSelect={handleSelect} />
      ),
      [handleSelect]
    );

    const keyExtractor = useCallback((item: ILightPlayer) => item.id, []);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.topPeekArea} />
          </TouchableWithoutFeedback>

          <View style={styles.sheet}>
            <View style={styles.dragHandle} />

            <View style={styles.header}>
              <Text style={styles.title}>🔍 Oyuncu Ara</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>Kapat ✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Örn: Mauro Icardi, Bellingham, Ronaldo..."
                placeholderTextColor={Colors.textMuted}
                value={query}
                onChangeText={handleQueryChange}
                autoFocus
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={5}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {query.trim().length >= 2
                      ? 'Eşleşen oyuncu bulunamadı.'
                      : 'Yukarıdaki görsele bakarak en az 2 harf yazın...'}
                  </Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

OfflinePlayerSearchModal.displayName = 'OfflinePlayerSearchModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 17, 0.28)',
    justifyContent: 'flex-end',
  },
  topPeekArea: {
    flex: 1,
  },
  sheet: {
    height: '55%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.lg + 6,
    borderTopRightRadius: BorderRadius.lg + 6,
    borderTopWidth: 1.5,
    borderTopColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 16,
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    paddingVertical: 11,
    fontSize: 15,
  },
  clearBtn: {
    marginLeft: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
  },
});
