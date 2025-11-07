import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import GlassBackground from './GlassBackground';

export default function FAB() {
  const colorScheme = useColorScheme();

  return (
    <GlassBackground style={[styles.fabContainer, { backgroundColor: 'transparent' }]}>
      <Pressable
        style={[styles.fab]}
        onPress={() => router.push('/upload')}
      >
        <MaterialIcons name="cloud-upload" size={24} color={Colors[colorScheme ?? 'light'].text} />
      </Pressable>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  fab: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
