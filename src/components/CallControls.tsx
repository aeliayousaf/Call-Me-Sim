import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CallControlButtonProps {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'danger' | 'active';
  size?: 'normal' | 'large';
}

export function CallControlButton({
  label,
  icon,
  onPress,
  variant = 'default',
  size = 'normal',
}: CallControlButtonProps) {
  const isLarge = size === 'large';
  const buttonSize = isLarge ? 72 : 60;

  const backgroundColor =
    variant === 'danger'
      ? '#FF3B30'
      : variant === 'active'
        ? '#FFFFFF'
        : 'rgba(255,255,255,0.2)';

  const iconColor = variant === 'active' ? '#000000' : '#FFFFFF';

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <View
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor,
          },
        ]}
      >
        <Text style={[styles.icon, { color: iconColor, fontSize: isLarge ? 28 : 22 }]}>
          {icon}
        </Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

interface IncomingCallControlsProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallControls({ onAccept, onDecline }: IncomingCallControlsProps) {
  return (
    <View style={styles.incomingRow}>
      <CallControlButton label="Decline" icon="✕" onPress={onDecline} variant="danger" size="large" />
      <CallControlButton label="Accept" icon="✓" onPress={onAccept} variant="active" size="large" />
    </View>
  );
}

interface ActiveCallControlsProps {
  muted: boolean;
  speaker: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

export function ActiveCallControls({
  muted,
  speaker,
  onToggleMute,
  onToggleSpeaker,
  onEndCall,
}: ActiveCallControlsProps) {
  return (
    <View style={styles.activeContainer}>
      <View style={styles.activeRow}>
        <CallControlButton
          label="Mute"
          icon={muted ? '🔇' : '🎤'}
          onPress={onToggleMute}
          variant={muted ? 'active' : 'default'}
        />
        <CallControlButton
          label="Speaker"
          icon={speaker ? '🔊' : '🔈'}
          onPress={onToggleSpeaker}
          variant={speaker ? 'active' : 'default'}
        />
      </View>
      <CallControlButton label="End" icon="✕" onPress={onEndCall} variant="danger" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontWeight: '700',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  incomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  activeContainer: {
    alignItems: 'center',
    gap: 32,
    width: '100%',
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
});
