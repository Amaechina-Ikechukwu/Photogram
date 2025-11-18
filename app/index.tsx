import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useState } from 'react';

export default function Index() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenWelcome');
      setHasSeenWelcome(value === 'true');
    } catch (e) {
      setHasSeenWelcome(false);
    }
  };

  if (hasSeenWelcome === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Navigate based on whether user has seen welcome
  if (hasSeenWelcome) {
    return <Redirect href="/(tabs)" />;
  } else {
    // @ts-ignore - welcome screen exists but TypeScript doesn't recognize it yet
    return <Redirect href="/welcome" />;
  }
}
