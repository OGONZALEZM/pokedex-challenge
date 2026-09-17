import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface PokeballSpinnerProps {
  readonly size?: number;
}

const DEFAULT_SIZE = 64;

/**
 * Themed loading indicator shaped as a Pokéball. Runs an infinite "capture"
 * shake animation (rotate ±25° with a beat pause between cycles) driven by
 * the design system's motion tokens.
 *
 * Uses the native driver so the animation runs on the UI thread and remains
 * smooth even while the JS thread is busy rendering the initial payload.
 */
export const PokeballSpinner = ({ size = DEFAULT_SIZE }: PokeballSpinnerProps) => {
  const theme = useTheme();
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 1,
          duration: theme.motion.duration.fast,
          easing: theme.motion.easing.emphasized,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -1,
          duration: theme.motion.duration.base,
          easing: theme.motion.easing.emphasized,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: theme.motion.duration.fast,
          easing: theme.motion.easing.emphasized,
          useNativeDriver: true,
        }),
        Animated.delay(theme.motion.duration.slow),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shake, theme]);

  const rotate = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-25deg', '25deg'],
  });

  const bodyColor = theme.colors.border.default;
  const bandColor = theme.colors.background.surface;

  const bandHeight = size * 0.12;
  const buttonSize = size * 0.22;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bodyColor,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: (size - bandHeight) / 2,
              left: 0,
              right: 0,
              height: bandHeight,
              backgroundColor: bandColor,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: (size - buttonSize) / 2,
              left: (size - buttonSize) / 2,
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: bandColor,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
