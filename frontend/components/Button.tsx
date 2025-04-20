import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  rightIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>
        {title}
      </Text>
      {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.gray[400],
  },
  iconContainer: {
    marginLeft: 8,
  },
});