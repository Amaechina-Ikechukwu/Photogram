import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

export default function FAB() {
  const colorScheme = useColorScheme();

  return (
    <Pressable style={[styles.fab, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={() => router.push('/upload')}>
      <MaterialIcons name="cloud-upload" size={24} color={Colors[colorScheme ?? 'light'].background} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
