import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';


// Firebase
import { ActivityIndicator } from 'react-native';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UploadProvider } from '../context/UploadContext';
import { apiPut } from '../utils/api';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://dde3af0fbb0fc3a59940b4cde24fc942@o4507437373980672.ingest.de.sentry.io/4511013701288016',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function UserSync() {
  const { user } = useAuth() || {};

  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        try {
          const token = await user.getIdToken();
          await apiPut('/users', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: user.displayName,
            }),
          });
        } catch (error) {
          console.error('Failed to sync user data:', error);
        }
      };
      syncUser();
    }
  }, [user]);

  return null;
}

export default Sentry.wrap(function RootLayout() {
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
      <UserSync />
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
});