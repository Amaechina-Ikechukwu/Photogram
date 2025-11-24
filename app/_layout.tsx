import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';


// Firebase
import { ActivityIndicator } from 'react-native';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider } from '../context/AuthContext';
import { UploadProvider } from '../context/UploadContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      // Hide the splash screen after fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    // Wait until fonts are loaded
    return null;
  }

  return (
    <AuthProvider>
      <UploadProvider>
        <ToastProvider>
          <Stack>
            {/* Welcome/Onboarding */}
            <Stack.Screen name="welcome" options={{ headerShown: false }} />

            {/* Tabs are protected, only for logged-in users */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Public screens */}
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen name="upload/index" options={{ headerShown: false }} />

            <Stack.Screen name="photo/[id]" options={{ headerShown: false }} />
            {/* Fallback */}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ToastProvider>
      </UploadProvider>
    </AuthProvider>
  );
}