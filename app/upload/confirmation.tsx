import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, FlatList, Dimensions, Pressable, ActivityIndicator, View, StatusBar, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpload } from '../../context/UploadContext';
import { useRouter, useNavigation } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const IMAGE_SIZE = width * 0.9;
const SPACING = 16;

export default function UploadConfirmationScreen() {
  const colorScheme = useColorScheme();
  const { imagesToUpload, startUpload, uploading } = useUpload();
  const router = useRouter();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const isDark = colorScheme === 'dark';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Confirm Upload',
      headerBackTitle: 'Back',
    });
  }, [navigation]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.imageWrapper}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.uri }} 
            style={styles.image}
            contentFit="cover"
          />
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Image Gallery */}
      <View style={styles.galleryContainer}>
        <FlatList
          data={imagesToUpload}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
          decelerationRate="fast"
          snapToAlignment="center"
          snapToInterval={IMAGE_SIZE + SPACING}
          contentContainerStyle={styles.imageList}
        />
        
        {/* Page Indicator */}
        {imagesToUpload.length > 1 && (
          <View style={styles.pageIndicatorContainer}>
            {imagesToUpload.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageIndicator,
                  index === currentIndex && styles.pageIndicatorActive,
                  { backgroundColor: index === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.4)' }
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <View style={[styles.actionContainer, { backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
          <View style={styles.infoContainer}>
            <ThemedText style={styles.countText}>
              {imagesToUpload.length} {imagesToUpload.length === 1 ? 'photo' : 'photos'} selected
            </ThemedText>
            <ThemedText style={styles.subtitleText}>
              {uploading ? 'Uploading in background...' : 'Ready to share your moments'}
            </ThemedText>
          </View>
          <View style={styles.switchContainer}>
              <ThemedText>Make Public</ThemedText>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
          <View style={styles.buttonContainer}>
            
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                { borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.back()}
              disabled={uploading}
            >
              <ThemedText style={[styles.cancelButtonText, { color: isDark ? '#fff' : '#000' }]}>
                Cancel
              </ThemedText>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.uploadButton,
                uploading && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => startUpload(isPublic)}
              disabled={uploading}
            >
              <LinearGradient
                colors={uploading ? ['#888', '#666'] : ['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                {uploading ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                    <ThemedText style={styles.uploadButtonText}>
                      Starting...
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText style={styles.uploadButtonText}>
                    Upload in Background
                  </ThemedText>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageList: {
    paddingHorizontal: (width - IMAGE_SIZE) / 2,
    alignItems: 'center',
  },
  imageWrapper: {
    width: IMAGE_SIZE + SPACING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pageIndicatorActive: {
    width: 24,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionContainer: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  infoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    opacity: 0.6,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  uploadButton: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
