import React from 'react';
import { Text, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

export function AppText({ children, style, ...props }: AppTextProps) {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
}
