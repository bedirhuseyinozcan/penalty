import React, { useState, useMemo } from 'react';
import { View, Image, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
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
    const [imageError, setImageError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const blurRadius = useMemo(() => {
      const remaining = Math.max(0, maxAttempts - currentAttempt - 1);
      return Math.round((remaining / Math.max(1, maxAttempts - 1)) * 26);
    }, [currentAttempt, maxAttempts]);

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {!isLoaded && !imageError && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}

          {imageUrl && !imageError ? (
            <Image
              key={imageUrl}
              source={{ uri: imageUrl }}
              style={[
                styles.image,
                Platform.OS === 'web' && blurRadius > 0
                  ? ({
                      filter: `blur(${blurRadius}px)`,
                      transform: [{ scale: 1.12 }],
                      transition: 'filter 0.4s ease, transform 0.4s ease',
                    } as any)
                  : undefined,
              ]}
              blurRadius={Platform.OS !== 'web' ? blurRadius : undefined}
              resizeMode="cover"
              onLoad={() => setIsLoaded(true)}
              onLoadEnd={() => setIsLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>👤</Text>
              <Text style={styles.placeholderText}>Gizemli Yıldız</Text>
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
    width: 190,
    height: 190,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#121722',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  spinnerContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 54,
    opacity: 0.6,
  },
  placeholderText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  levelBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(11, 14, 20, 0.88)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 2,
  },
  levelBadgeText: {
    ...Typography.statBadge,
    color: Colors.accent,
    fontWeight: '700',
  },
  subtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
