import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ICareerPathGuess } from '../types';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ICareerGuessRowProps {
  guess: ICareerPathGuess;
}

const CareerGuessRow: React.FC<ICareerGuessRowProps> = React.memo(({ guess }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Animated.View
      style={[
        styles.guessRow,
        guess.isCorrect ? styles.correctRow : styles.wrongRow,
        {
          opacity: anim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.guessName}>
        {guess.isCorrect ? '✅ ' : '❌ '}
        {guess.playerName} ({guess.club})
      </Text>
    </Animated.View>
  );
});

CareerGuessRow.displayName = 'CareerGuessRow';

interface ICareerGuessHistoryProps {
  guesses: ICareerPathGuess[];
}

export const CareerGuessHistory: React.FC<ICareerGuessHistoryProps> = React.memo(({ guesses }) => {
  if (guesses.length === 0) return null;

  return (
    <View style={styles.guessHistory}>
      <Text style={styles.historyTitle}>Yapılan Tahminler:</Text>
      {guesses.map((g, idx) => (
        <CareerGuessRow key={`${g.playerId}_${idx}`} guess={g} />
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
