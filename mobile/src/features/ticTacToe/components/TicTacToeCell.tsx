import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ITicTacToeCellState } from '../types';
import { Colors } from '../../../theme/colors';
import { BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ITicTacToeCellProps {
  cell: ITicTacToeCellState;
  isSelected: boolean;
  onPress: (cellIndex: number) => void;
  disabled?: boolean;
}

export const TicTacToeCell: React.FC<ITicTacToeCellProps> = React.memo(
  ({ cell, isSelected, onPress, disabled = false }) => {
    const { cellIndex, isFilled, guessedPlayer } = cell;

    return (
      <TouchableOpacity
        style={[
          styles.cell,
          isSelected && styles.selectedCell,
          isFilled && styles.filledCell,
        ]}
        activeOpacity={0.75}
        onPress={() => onPress(cellIndex)}
        disabled={disabled || isFilled}
      >
        {isFilled && guessedPlayer ? (
          <View style={styles.filledContent}>
            <Text style={styles.checkIcon}>✅</Text>
            <Text style={styles.playerName} numberOfLines={2}>
              {guessedPlayer.name}
            </Text>
            <Text style={styles.playerClub} numberOfLines={1}>
              {guessedPlayer.club}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContent}>
            <Text style={[styles.plusIcon, isSelected && styles.selectedPlus]}>
              {isSelected ? '🎯' : '+'}
            </Text>
            <Text style={styles.cellSubtext}>
              {isSelected ? 'Seçildi' : 'Doldur'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

TicTacToeCell.displayName = 'TicTacToeCell';

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  selectedCell: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    transform: [{ scale: 1.02 }],
  },
  filledCell: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
  },
  filledContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  checkIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  playerName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 13,
  },
  playerClub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  selectedPlus: {
    color: Colors.primary,
  },
  cellSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
});
