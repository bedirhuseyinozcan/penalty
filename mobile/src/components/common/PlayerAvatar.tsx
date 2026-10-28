import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Colors } from '../../theme/colors';

export interface IPlayerAvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  isLegend?: boolean;
}

export const PlayerAvatar: React.FC<IPlayerAvatarProps> = React.memo(
  ({ imageUrl, name, size = 44, style, imageStyle, isLegend = false }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      setHasError(false);
    }, [imageUrl]);

    const initials = React.useMemo(() => {
      if (!name) return '⚽';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [name]);

    const isValidUrl = Boolean(
      imageUrl &&
      typeof imageUrl === 'string' &&
      imageUrl.startsWith('http') &&
      !hasError
    );

    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: isLegend ? '#FACC15' : Colors.border,
          },
          style,
        ]}
      >
        {isValidUrl ? (
          <Image
            source={{ uri: imageUrl! }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, imageStyle]}
            resizeMode="cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <View style={styles.fallbackContent}>
            <Text style={[styles.initialsText, { fontSize: Math.max(10, Math.floor(size * 0.36)) }]}>
              {isLegend ? `👑 ${initials}` : initials}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

PlayerAvatar.displayName = 'PlayerAvatar';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: Colors.surface,
  },
  fallbackContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  initialsText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
