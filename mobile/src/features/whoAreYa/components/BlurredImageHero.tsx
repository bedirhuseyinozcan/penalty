import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IBlurredImageHeroProps {
  imageUrl?: string;
  currentAttempt: number;
  maxAttempts: number;
}

export const BlurredImageHero = React.memo<IBlurredImageHeroProps>(
  ({ imageUrl, currentAttempt, maxAttempts }) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>⚽</Text>
            </View>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              Netlik: Seviye {Math.min(currentAttempt + 1, maxAttempts)}/{maxAttempts}
            </Text>
          </View>
        </View>

        <Text style={styles.subtext}>
          Her yanlış tahminde fotoğraf bir kademe daha netleşir!
        </Text>
      </View>
    );
  }
);

BlurredImageHero.displayName = 'BlurredImageHero';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  imageContainer: {
    width: 180,
    height: 180,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  levelBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(11, 14, 20, 0.85)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  levelBadgeText: {
    ...Typography.statBadge,
    color: Colors.accent,
  },
  subtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
