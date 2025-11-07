import React from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { useUpload } from '@/context/UploadContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function UploadProgressBar() {
  const { uploads, uploading } = useUpload();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeUpload = uploads[0];

  if (!uploading || !activeUpload) {
    return null;
  }

  const progress = activeUpload.progress || 0;

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>Uploading...</ThemedText>
            <ThemedText style={styles.subtitle}>
              {activeUpload.completedFiles} of {activeUpload.totalFiles} photos • {Math.round(progress)}%
            </ThemedText>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBackground, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  textContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
