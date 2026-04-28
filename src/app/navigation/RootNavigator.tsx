import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MainTabsNavigator } from './MainTabsNavigator';

export function RootNavigator() {
  return (
    <NavigationContainer>
      <MainTabsNavigator />
    </NavigationContainer>
  );
}
