import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IWhoAreYaGuess } from '../types';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IGuessRowItemProps {
  guess: IWhoAreYaGuess;
  index: number;
}

export const GuessRowItem = React.memo<IGuessRowItemProps>(({ guess, index }) => {
  const { player, comparison } = guess;

  const getBgColor = (status: 'correct' | 'wrong' | 'higher' | 'lower') => {
    if (status === 'correct') return Colors.matchCorrect;
    return Colors.matchWrong;
  };

  const getAgeIndicator = (status: 'correct' | 'higher' | 'lower') => {
    if (status === 'correct') return '';
    if (status === 'higher') return ' ⬆️'; 
    return ' ⬇️';
  };

  return (
    <View style={styles.container}>
      <View style={styles.nameHeader}>
        <Text style={styles.indexText}>#{index + 1}</Text>
        <Text style={styles.nameText} numberOfLines={1}>
          {player.name}
        </Text>
      </View>

      <View style={styles.tilesGrid}>
        <View style={[styles.tile, { backgroundColor: getBgColor(comparison.club) }]}>
          <Text style={styles.tileLabel}>Kulüp</Text>
          <Text style={styles.tileValue} numberOfLines={1}>
            {player.club}
          </Text>
        </View>
        <View style={[styles.tile, { backgroundColor: getBgColor(comparison.league) }]}>
          <Text style={styles.tileLabel}>Lig</Text>
          <Text style={styles.tileValue} numberOfLines={1}>
            {player.league}
          </Text>
        </View>
        <View style={[styles.tile, { backgroundColor: getBgColor(comparison.nationality) }]}>
          <Text style={styles.tileLabel}>Uyruk</Text>
          <Text style={styles.tileValue} numberOfLines={1}>
            {player.nationality}
          </Text>
        </View>
        <View style={[styles.tile, { backgroundColor: getBgColor(comparison.position) }]}>
          <Text style={styles.tileLabel}>Mevki</Text>
          <Text style={styles.tileValue}>{player.position}</Text>
        </View>
        <View style={[styles.tile, { backgroundColor: getBgColor(comparison.age) }]}>
          <Text style={styles.tileLabel}>Yaş</Text>
          <Text style={styles.tileValue}>
            {player.age ? `${player.age}${getAgeIndicator(comparison.age)}` : '-'}
          </Text>
        </View>
      </View>
    </View>
  );
});

GuessRowItem.displayName = 'GuessRowItem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  indexText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
    marginRight: Spacing.xs,
  },
  nameText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  tilesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  tile: {
    flex: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  tileLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tileValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
    textAlign: 'center',
  },
});
