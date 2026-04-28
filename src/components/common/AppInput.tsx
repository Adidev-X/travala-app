import React from 'react';
import { View, TextInput, Text, TextInputProps, ViewStyle } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function AppInput({ label, containerStyle, ...props }: AppInputProps) {
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#5d3f3c', textTransform: 'uppercase', letterSpacing: 1.5, paddingLeft: 16 }}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#5d3f3c80"
        style={{
          backgroundColor: '#f4f4f580',
          borderRadius: 16,
          padding: 16,
          fontSize: 15,
          fontWeight: '500',
          color: '#291715',
        }}
        {...props}
      />
    </View>
  );
}
