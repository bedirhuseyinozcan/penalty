import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { IBingoTile } from '../types';
import { Colors } from '../../../theme/colors';
import { BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IBingoCellProps {
  tile: IBingoTile;
  isWrongFlash: boolean;
  onPress: (index: number) => void;
  disabled?: boolean;
}

export const BingoCell: React.FC<IBingoCellProps> = React.memo(
  ({ tile, isWrongFlash, onPress, disabled = false }) => {
    const { index, emoji, title, subtitle, isMatched, matchedPlayer } = tile;

    return (
      <TouchableOpacity
        style={[
          styles.cell,
          isMatched && styles.matchedCell,
          isWrongFlash && styles.wrongFlashCell,
        ]}
        activeOpacity={0.7}
        onPress={() => onPress(index)}
        disabled={disabled || isMatched}
      >
        {isMatched && matchedPlayer ? (
          <View style={styles.matchedContent}>
            <Text style={styles.checkIcon}>✅</Text>
            <Text style={styles.matchedPlayerName} numberOfLines={2}>
              {matchedPlayer.name}
            </Text>
            <Text style={styles.matchedTileTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : (
          <View style={styles.unmatchedContent}>
            <Text style={styles.tileEmoji}>{emoji}</Text>
            <Text style={styles.tileTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.tileSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

BingoCell.displayName = 'BingoCell';

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  matchedCell: {
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    borderColor: Colors.success,
  },
  wrongFlashCell: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444',
  },
  unmatchedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tileEmoji: {
    fontSize: 13,
    marginBottom: 1,
  },
  tileTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 9.5,
    textAlign: 'center',
    lineHeight: 11,
  },
  tileSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 7.5,
    textAlign: 'center',
    marginTop: 1,
  },
  matchedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  checkIcon: {
    fontSize: 12,
    marginBottom: 1,
  },
  matchedPlayerName: {
    ...Typography.captionBold,
    color: Colors.success,
    fontSize: 9.5,
    textAlign: 'center',
    lineHeight: 11,
  },
  matchedTileTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 7.5,
    textAlign: 'center',
  },
});
