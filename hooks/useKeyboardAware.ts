// ─── useKeyboardAware ────────────────────────────────────────────────────────
// Tracks keyboard height and visibility.
// Used to push sticky bottom bars above the keyboard when it opens.
//
// @example
// const { keyboardHeight, isKeyboardVisible } = useKeyboardAware();
// <View style={{ paddingBottom: keyboardHeight }} />

import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

export interface UseKeyboardAwareReturn {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

export function useKeyboardAware(): UseKeyboardAwareReturn {
  const [keyboardHeight,    setKeyboardHeight]    = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const onHide = () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
}
