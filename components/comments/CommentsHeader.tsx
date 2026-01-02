import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

type CommentsHeaderProps = {
  commentsCount: number;
};

export default function CommentsHeader({ commentsCount }: CommentsHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          Comments
        </Text>
        <View style={[styles.badge, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
          <Text style={[styles.badgeText, { color: isDark ? '#fff' : '#000' }]}>
            {commentsCount}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
