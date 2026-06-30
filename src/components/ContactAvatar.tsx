import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ContactAvatarProps {
  name: string;
  imageUri?: string;
  size?: number;
  dark?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ContactAvatar({ name, imageUri, size = 120, dark = true }: ContactAvatarProps) {
  const fontSize = size * 0.35;

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dark ? '#3A3A3C' : '#D1D1D6',
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: dark ? '#FFFFFF' : '#1C1C1E' }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});
