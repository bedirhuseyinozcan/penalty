import React, { useCallback } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { GuessRowItem } from './GuessRowItem';
import { IWhoAreYaGuess } from '../types';
import { Colors } from '../../../theme/colors';
import { Spacing } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IGuessHistoryListProps {
  guesses: IWhoAreYaGuess[];
}

export const GuessHistoryList = React.memo<IGuessHistoryListProps>(({ guesses }) => {
  const renderItem = useCallback(
    ({ item, index }: { item: IWhoAreYaGuess; index: number }) => (
      <GuessRowItem guess={item} index={index} />
    ),
    []
  );

  const keyExtractor = useCallback((item: IWhoAreYaGuess, index: number) => {
    return `${item.player.id}_${index}`;
  }, []);

  if (guesses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henüz bir tahminde bulunmadınız.</Text>
        <Text style={styles.emptySubtext}>Aşağıdaki butona dokunarak oyuncu seçin.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={guesses}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
    />
  );
});

GuessHistoryList.displayName = 'GuessHistoryList';

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
