import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, useColorScheme, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

type ToastOptions = {
  type?: ToastType;
  duration?: number; // ms
};

type ToastContextValue = {
  show: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const background = useMemo(() => {
    if (type === 'success') return '#34C759';
    if (type === 'error') return '#FF3B30';
    return colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.8)';
  }, [type, colorScheme]);

  const textColor = useMemo(() => {
    if (type === 'success' || type === 'error') return '#fff';
    return colorScheme === 'dark' ? '#fff' : '#fff';
  }, [type, colorScheme]);

  const clearTimer = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  };

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [opacity, translateY]);

  const show = useCallback((msg: string, opts?: ToastOptions) => {
    clearTimer();
    setMessage(msg);
    setType(opts?.type ?? 'info');
    setVisible(true);

    opacity.setValue(0);
    translateY.setValue(20);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    const duration = opts?.duration ?? 2500;
    hideTimeout.current = setTimeout(hide, duration);
  }, [hide, opacity, translateY]);

  const contextValue = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast overlay */}
      {visible && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={styles.wrapper}>
            <Animated.View style={[styles.toast, { backgroundColor: background, opacity, transform: [{ translateY }] }]}>
              <Text style={[styles.text, { color: textColor }]} numberOfLines={3}>
                {message}
              </Text>
            </Animated.View>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.select({ ios: 80, android: 60, default: 40 }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    maxWidth: '90%',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
