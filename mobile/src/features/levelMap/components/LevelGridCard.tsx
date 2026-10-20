import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ILevelItem } from '../types';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';

interface ILevelGridCardProps {
  item: ILevelItem;
  onPress: (levelNumber: number) => void;
}

export const LevelGridCard: React.FC<ILevelGridCardProps> = React.memo(({ item, onPress }) => {
  const { levelNumber, status } = item;
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';

  const handlePress = useCallback(() => {
    onPress(levelNumber);
  }, [onPress, levelNumber]);

  return (
    <TouchableOpacity
      style={[
        styles.levelCard,
        isCompleted && styles.completedCard,
        isCurrent && styles.currentCard,
        isLocked && styles.lockedCard,
      ]}
      activeOpacity={isLocked ? 0.9 : 0.7}
      onPress={handlePress}
    >
      <View style={styles.cardHeader}>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedIcon}>✅</Text>
          </View>
        ) : isCurrent ? (
          <View style={styles.currentBadge}>
            <Text style={styles.currentIcon}>⭐</Text>
          </View>
        ) : (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedIcon}>🔒</Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.levelNumber,
          isCompleted && styles.completedNumber,
          isCurrent && styles.currentNumber,
          isLocked && styles.lockedNumber,
        ]}
      >
        {levelNumber}
      </Text>

      <Text
        style={[
          styles.levelStatusText,
          isCompleted && styles.completedStatusText,
          isCurrent && styles.currentStatusText,
          isLocked && styles.lockedStatusText,
        ]}
      >
        {isCompleted ? 'Geçildi' : isCurrent ? 'Oyna ▶' : 'Kilitli'}
      </Text>
    </TouchableOpacity>
  );
});

LevelGridCard.displayName = 'LevelGridCard';

const styles = StyleSheet.create({
  levelCard: {
    width: '23%',
    aspectRatio: 0.9,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  completedCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: '#22C55E',
  },
  currentCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  lockedCard: {
    backgroundColor: Colors.surfaceLight,
    borderColor: 'transparent',
    opacity: 0.55,
  },
  cardHeader: {
    marginBottom: 2,
  },
  completedBadge: {},
  completedIcon: {
    fontSize: 14,
  },
  currentBadge: {},
  currentIcon: {
    fontSize: 14,
  },
  lockedBadge: {},
  lockedIcon: {
    fontSize: 14,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  completedNumber: {
    color: '#22C55E',
  },
  currentNumber: {
    color: '#10B981',
  },
  lockedNumber: {
    color: Colors.textMuted,
  },
  levelStatusText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  completedStatusText: {
    color: '#22C55E',
  },
  currentStatusText: {
    color: '#10B981',
  },
  lockedStatusText: {
    color: Colors.textMuted,
  },
});
