import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  large?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  large = false,
}: ButtonProps) {
  const { theme } = useSettings();

  const backgroundColor = {
    primary: theme.primary,
    secondary: theme.surface,
    danger: theme.danger,
    success: theme.success,
    ghost: 'transparent',
  }[variant];

  const textColor = {
    primary: '#FFFFFF',
    secondary: theme.text,
    danger: '#FFFFFF',
    success: '#FFFFFF',
    ghost: theme.primary,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        { backgroundColor, opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: theme.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, large && styles.largeText, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    minHeight: 64,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
  },
  largeText: {
    fontSize: 20,
    fontWeight: '700',
  },
});
