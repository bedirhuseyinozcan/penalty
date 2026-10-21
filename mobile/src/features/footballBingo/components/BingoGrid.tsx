import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IBingoTile } from '../types';
import { BingoCell } from './BingoCell';
import { Spacing } from '../../../theme/spacing';

interface IBingoGridProps {
  tiles: IBingoTile[];
  wrongFlashTileIndex: number | null;
  onSelectTile: (index: number) => void;
  disabled?: boolean;
}

export const BingoGrid: React.FC<IBingoGridProps> = React.memo(
  ({ tiles, wrongFlashTileIndex, onSelectTile, disabled = false }) => {
    return (
      <View style={styles.gridContainer}>
        {[0, 1, 2, 3].map((rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {[0, 1, 2, 3].map((colIdx) => {
              const tileIdx = rowIdx * 4 + colIdx;
              const tile = tiles[tileIdx];
              if (!tile) return null;

              return (
                <BingoCell
                  key={tile.id}
                  tile={tile}
                  isWrongFlash={wrongFlashTileIndex === tileIdx}
                  onPress={onSelectTile}
                  disabled={disabled}
                />
              );
            })}
          </View>
        ))}
      </View>
    );
  }
);

BingoGrid.displayName = 'BingoGrid';

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
});
