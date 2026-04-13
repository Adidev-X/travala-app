import React, { useCallback, useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** e.g. ['50%', '90%'] — first snap used on open */
  snapPoints?: [string, string];
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

function parseSnapPoint(snap: string): number {
  if (snap.endsWith('%')) {
    return (parseFloat(snap) / 100) * SCREEN_HEIGHT;
  }
  return parseFloat(snap);
}

// ─── Component ────────────────────────────────────────────────────────────────

const BottomSheet = React.memo<BottomSheetProps>(
  ({ visible, onClose, title, children, snapPoints = ['50%', '90%'] }) => {
    const sheetHeight = parseSnapPoint(snapPoints[0]);
    const translateY = useRef(new Animated.Value(sheetHeight)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const animateOpen = useCallback(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 180,
          mass: 0.8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }, [translateY, backdropOpacity]);

    const animateClose = useCallback(
      (callback?: () => void) => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: sheetHeight,
            useNativeDriver: true,
            damping: 22,
            stiffness: 180,
            mass: 0.8,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(() => callback?.());
      },
      [translateY, backdropOpacity, sheetHeight]
    );

    useEffect(() => {
      if (visible) {
        translateY.setValue(sheetHeight);
        animateOpen();
      }
    }, [visible, animateOpen, sheetHeight, translateY]);

    const handleClose = useCallback(() => {
      animateClose(onClose);
    }, [animateClose, onClose]);

    if (!visible) return null;

    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight, transform: [{ translateY }] },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {title ? <Text style={styles.title}>{title}</Text> : null}

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </Modal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.slate300,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate900,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
});
