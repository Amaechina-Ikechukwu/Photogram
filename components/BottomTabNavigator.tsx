
import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/firebaseConfig';
import { useToast } from '@/components/ToastProvider';
import TabBarBackground, { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import IndexScreen from '../app/(tabs)/index';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const toast = useToast();
  const auth = getAuth(app);
  const bottomOverflow = useBottomTabOverflow();

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
    <Tab.Navigator
  // Make the navigator's scene avoid being covered by the floating tab bar.
  // paddingBottom = bottom margin (20) + tab height (70) + any platform-specific overflow (safe area / tab bar height)
  sceneContainerStyle={{ paddingBottom: 20 + 70 + (bottomOverflow ?? 0) }}
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
        // Render the platform-specific tab bar background (iOS uses a Blur view)
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          // allow the shadow to be visible outside the tab bar bounds
          overflow: 'visible',
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderRadius: 15,
          height: 70,
          shadowColor: Colors[colorScheme ?? 'light'].tint,
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
          paddingHorizontal: 10,
        },
      }}>
      <Tab.Screen
        name="index"
        component={IndexScreen}
        options={{
          title: 'Photos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="photo-library" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

