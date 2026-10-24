import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { searchEngine } from '../../services/searchEngine';

export interface IClubLogoProps {
  logoUrl?: string | null;
  clubName?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  fallbackEmoji?: string;
}

export const ClubLogo: React.FC<IClubLogoProps> = React.memo(
  ({
    logoUrl,
    clubName,
    size = 26,
    style,
    imageStyle,
    fallbackEmoji = '🛡️',
  }) => {
    const [hasError, setHasError] = useState(false);

    const resolvedUrl = useMemo(() => {
      if (logoUrl && typeof logoUrl === 'string' && logoUrl.startsWith('http')) {
        return logoUrl;
      }
      if (clubName) {
        return searchEngine.getClubLogo(clubName);
      }
      return undefined;
    }, [logoUrl, clubName]);

    useEffect(() => {
      setHasError(false);
    }, [resolvedUrl]);

    if (resolvedUrl && !hasError) {
      return (
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={{ uri: resolvedUrl }}
            style={[styles.image, { width: size, height: size }, imageStyle]}
            resizeMode="contain"
            onError={() => setHasError(true)}
          />
        </View>
      );
    }

    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Text
          style={[
            styles.fallback,
            { fontSize: Math.max(10, Math.round(size * 0.62)) },
          ]}
        >
          {fallbackEmoji}
        </Text>
      </View>
    );
  }
);

ClubLogo.displayName = 'ClubLogo';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    borderRadius: 2,
  },
  fallback: {
    textAlign: 'center',
  },
});
