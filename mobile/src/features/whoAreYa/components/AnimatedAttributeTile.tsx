import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { BorderRadius } from '../../../theme/spacing';

interface IAnimatedAttributeTileProps {
  label: string;
  value: string;
  status: 'correct' | 'wrong' | 'higher' | 'lower';
  delay?: number;
}

export const AnimatedAttributeTile: React.FC<IAnimatedAttributeTileProps> = React.memo(
  ({ label, value, status, delay = 0 }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }).start();
    }, [anim, delay]);

    const scale = anim.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [0.75, 1.05, 1],
    });

    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0],
    });

    const opacity = anim;

    const bgColor = status === 'correct' ? Colors.matchCorrect : Colors.matchWrong;

    return (
      <Animated.View
        style={[
          styles.tile,
          {
            backgroundColor: bgColor,
            opacity,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileValue} numberOfLines={1}>
          {value}
        </Text>
      </Animated.View>
    );
  }
);

AnimatedAttributeTile.displayName = 'AnimatedAttributeTile';

const styles = StyleSheet.create({
  tile: {
    width: '19%',
    aspectRatio: 0.9,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  tileLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  tileValue: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
});
