import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useOfflinePlayerSearch } from '../hooks/useOfflinePlayerSearch';
import { PlayerSearchItem } from './PlayerSearchItem';
import { ILightPlayer } from '../../../services/searchEngine';
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
        clearSearch();
        onSelectPlayer(player);
        onClose();
      },
      [clearSearch, onSelectPlayer, onClose]
    );

    const renderItem = useCallback(
      ({ item }: { item: ILightPlayer }) => (
        <PlayerSearchItem player={item} onSelect={handleSelect} />
      ),
      [handleSelect]
    );

    const keyExtractor = useCallback((item: ILightPlayer) => item.id, []);

    return (
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
           
            <View style={styles.header}>
              <Text style={styles.title}>Oyuncu Ara</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>Kapat</Text>
              </TouchableOpacity>
            </View>

          
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Örn: Mauro Icardi, Bellingham..."
                placeholderTextColor={Colors.textMuted}
                value={query}
                onChangeText={handleQueryChange}
                autoFocus
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {query.trim().length >= 2
                      ? 'Eşleşen oyuncu bulunamadı.'
                      : 'En az 2 harf yazarak çevrimdışı arama yapabilirsiniz.'}
                  </Text>
                </View>
              }
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  }
);

OfflinePlayerSearchModal.displayName = 'OfflinePlayerSearchModal';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  inputContainer: {
    padding: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
