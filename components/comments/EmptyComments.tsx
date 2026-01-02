import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function EmptyComments() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1a1a1a' : '#f8f8f8' }]}>
        <Ionicons name="chatbubble-outline" size={32} color={isDark ? '#444' : '#ccc'} />
      </View>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        No comments yet
      </Text>
      <Text style={styles.subtitle}>
        Start the conversation.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
});
