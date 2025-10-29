import { useState } from 'react';
import { Tabs } from 'expo-router';
import { ActivityIndicator, Pressable } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/firebaseConfig';
import { useToast } from '@/components/ToastProvider';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import GlassBottomTab from '@/components/GlassBottomTab';

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
      tabBar={(props) => <GlassBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
        headerRight: () => (
          <Pressable onPress={onLogout} style={{ marginRight: 12 }} disabled={loggingOut}>
            {loggingOut ? (
              <ActivityIndicator color={Colors[colorScheme ?? 'light'].tint} />
            ) : (
              <MaterialIcons name="logout" size={22} color={Colors[colorScheme ?? 'light'].tint} />
            )}
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="photo-library" 
              size={focused ? 26 : 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, focused }) => (
            <Feather 
              name="hash" 
              size={focused ? 26 : 24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}