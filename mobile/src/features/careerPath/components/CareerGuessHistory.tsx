import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ICareerPathGuess } from '../types';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ICareerGuessHistoryProps {
  guesses: ICareerPathGuess[];
}

export const CareerGuessHistory: React.FC<ICareerGuessHistoryProps> = React.memo(({ guesses }) => {
  if (guesses.length === 0) return null;

  return (
    <View style={styles.guessHistory}>
      <Text style={styles.historyTitle}>Yapılan Tahminler:</Text>
      {guesses.map((g, idx) => (
        <View
          key={`${g.playerId}_${idx}`}
          style={[styles.guessRow, g.isCorrect ? styles.correctRow : styles.wrongRow]}
        >
          <Text style={styles.guessName}>
            {g.isCorrect ? '✅ ' : '❌ '}
            {g.playerName} ({g.club})
          </Text>
        </View>
      ))}
    </View>
  );
});

CareerGuessHistory.displayName = 'CareerGuessHistory';

const styles = StyleSheet.create({
  guessHistory: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  historyTitle: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  guessRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
  },
  correctRow: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22C55E',
  },
  wrongRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  guessName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
});
