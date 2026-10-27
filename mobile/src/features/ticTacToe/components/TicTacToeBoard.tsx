import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { IGridCriterion, ITicTacToeCellState } from '../types';
import { TicTacToeCell } from './TicTacToeCell';
import { ClubLogo } from '../../../components/common/ClubLogo';
import { useFeedbackAnimation } from '../../../hooks/useFeedbackAnimation';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ITicTacToeBoardProps {
  rows: [IGridCriterion, IGridCriterion, IGridCriterion];
  cols: [IGridCriterion, IGridCriterion, IGridCriterion];
  cells: ITicTacToeCellState[];
  selectedCellIndex: number | null;
  onSelectCell: (index: number) => void;
  lastFeedback?: string | null;
  disabled?: boolean;
}

export const TicTacToeBoard: React.FC<ITicTacToeBoardProps> = React.memo(
  ({ rows, cols, cells, selectedCellIndex, onSelectCell, lastFeedback, disabled = false }) => {
    const { animatedStyle, triggerShake, triggerPulse } = useFeedbackAnimation();

    useEffect(() => {
      if (!lastFeedback) return;
      if (lastFeedback.startsWith('❌') || lastFeedback.startsWith('⚠️')) {
        triggerShake();
      } else if (lastFeedback.startsWith('✅') || lastFeedback.startsWith('💡')) {
        triggerPulse();
      }
    }, [lastFeedback, triggerShake, triggerPulse]);

    return (
      <Animated.View style={[styles.boardWrapper, animatedStyle]}>
        {/* Top Header Row (Corner empty + 3 Column headers) */}
        <View style={styles.gridRow}>
          <View style={styles.cornerHeader}>
            <Text style={styles.cornerIcon}>⚽</Text>
          </View>
          {cols.map((col) => (
            <View key={col.id} style={styles.colHeader}>
              {col.type === 'club' ? (
                <ClubLogo
                  logoUrl={col.logoUrl}
                  clubName={col.label || col.value}
                  size={24}
                  fallbackEmoji={col.badgeText}
                />
              ) : (
                <Text style={styles.headerEmoji}>{col.badgeText}</Text>
              )}
              <Text style={styles.headerTitle} numberOfLines={2}>
                {col.label}
              </Text>
              {col.subLabel ? (
                <Text style={styles.headerSubtitle}>{col.subLabel}</Text>
              ) : null}
            </View>
          ))}
        </View>

        {rows.map((rowCrit, rowIdx) => (
          <View key={rowCrit.id} style={styles.gridRow}>
            {/* Left Row Header */}
            <View style={styles.rowHeader}>
              {rowCrit.type === 'club' ? (
                <ClubLogo
                  logoUrl={rowCrit.logoUrl}
                  clubName={rowCrit.label || rowCrit.value}
                  size={24}
                  fallbackEmoji={rowCrit.badgeText}
                />
              ) : (
                <Text style={styles.headerEmoji}>{rowCrit.badgeText}</Text>
              )}
              <Text style={styles.headerTitle} numberOfLines={2}>
                {rowCrit.label}
              </Text>
              {rowCrit.subLabel ? (
                <Text style={styles.headerSubtitle}>{rowCrit.subLabel}</Text>
              ) : null}
            </View>

            {[0, 1, 2].map((colIdx) => {
              const cellIdx = rowIdx * 3 + colIdx;
              const cell = cells[cellIdx];
              return (
                <TicTacToeCell
                  key={cellIdx}
                  cell={cell}
                  isSelected={selectedCellIndex === cellIdx}
                  onPress={onSelectCell}
                  disabled={disabled}
                />
              );
            })}
          </View>
        ))}
      </Animated.View>
    );
  }
);

TicTacToeBoard.displayName = 'TicTacToeBoard';

const styles = StyleSheet.create({
  boardWrapper: {
    width: '100%',
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  cornerHeader: {
    width: '26%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cornerIcon: {
    fontSize: 22,
    opacity: 0.7,
  },
  colHeader: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  rowHeader: {
    width: '26%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  headerEmoji: {
    fontSize: 14,
    marginBottom: 1,
  },
  headerTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 1,
  },
});
