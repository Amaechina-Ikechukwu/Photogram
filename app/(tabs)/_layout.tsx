import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, View, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/firebaseConfig';
import { useToast } from '@/components/ToastProvider';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import GlassBottomTab from '@/components/GlassBottomTab';
import { useAuth } from '../../context/AuthContext';
import { useUpload } from '../../context/UploadContext';
import CircularProgress from '@/components/ui/CircularProgress';
import { ThemedText } from '@/components/ThemedText';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const toast = useToast();
  const authUser = useAuth();
  
  const { uploads } = useUpload();

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const auth = getAuth(app);
      await signOut(auth);
      authUser?.setUser(null);
      toast.show('Logged out', { type: 'success' });
    } catch (e: any) {
      const msg = e?.message ?? 'Logout failed';
      toast.show(msg, { type: 'error' });
    } finally {
      setLoggingOut(false);
    }
  };
  // useEffect(()=>{
  //   async()=>{
  //     const token = await authUser?.user?.getIdToken()
  //     console.log(token)
  //   }
  // },[])

  const upload = uploads[0];

  return (
    <>
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
              <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons 
                name="person-outline" 
                size={focused ? 26 : 24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
      {upload && (
        <View style={styles.uploadProgressContainer}>
          <CircularProgress
            progress={upload.progress}
            size={60}
            strokeWidth={8}
            color={Colors[colorScheme ?? 'light'].tint}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  uploadProgressContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 10,
  },
});