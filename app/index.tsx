import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);
  const authContext = useAuth();
  const user = authContext?.user;
  const isAuthLoading = authContext?.isLoading ?? true;

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenWelcome');
        setHasSeenWelcome(value === 'true');
      } catch {
        setHasSeenWelcome(false);
      }
    };

    checkWelcomeStatus();
  }, []);

  if (hasSeenWelcome === null || isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!hasSeenWelcome) {
    return <Redirect href="/welcome" />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}