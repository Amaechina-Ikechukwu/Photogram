import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/firebaseConfig';
import { useToast } from '@/components/ToastProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const toast = useToast();
  const auth = getAuth(app);

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut(auth);
      toast.show('Logged out', { type: 'success' });
      // Auth observer in app/_layout handles navigation
    } catch (e: any) {
      const msg = e?.message ?? 'Logout failed';
      toast.show(msg, { type: 'error' });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerRight: () => (
          <Pressable onPress={onLogout} style={{ marginRight: 12 }} disabled={loggingOut}>
            {loggingOut ? (
              <ActivityIndicator color={Colors[colorScheme ?? 'light'].tint} />
            ) : (
              <MaterialIcons name="logout" size={22} color={Colors[colorScheme ?? 'light'].tint} />
            )}
          </Pressable>
        ),
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
 
      <Tabs.Screen
        name="index"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="photo-library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="cloud-upload" size={size} color={color} />
          ),
        }}
      />
  
    </Tabs>
  );
}
