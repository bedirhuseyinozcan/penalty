import { useRef, useCallback, useEffect, useMemo } from 'react';
import { Animated, Platform } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export const useFeedbackAnimation = () => {
  const shakeX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const activeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      activeAnimRef.current?.stop();
      activeAnimRef.current = null;
    };
  }, []);

  const triggerShake = useCallback(() => {
    activeAnimRef.current?.stop();
    shakeX.setValue(0);

    const anim = Animated.sequence([
      Animated.timing(shakeX, { toValue: -9, duration: 50, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shakeX, { toValue: 9, duration: 50, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shakeX, { toValue: -6, duration: 45, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shakeX, { toValue: 6, duration: 45, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shakeX, { toValue: 0, duration: 40, useNativeDriver: USE_NATIVE_DRIVER }),
    ]);

    activeAnimRef.current = anim;
    anim.start(() => {
      activeAnimRef.current = null;
    });
  }, [shakeX]);

  const triggerPulse = useCallback(() => {
    activeAnimRef.current?.stop();
    scale.setValue(1);

    const anim = Animated.sequence([
      Animated.timing(scale, { toValue: 1.05, duration: 110, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);

    activeAnimRef.current = anim;
    anim.start(() => {
      activeAnimRef.current = null;
    });
  }, [scale]);

  const animatedStyle = useMemo(
    () => ({
      transform: [{ translateX: shakeX }, { scale }],
    }),
    [shakeX, scale]
  );

  return {
    animatedStyle,
    triggerShake,
    triggerPulse,
  };
};
