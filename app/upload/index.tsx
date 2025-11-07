import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, FlatList, Dimensions, Alert, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpload } from '../../context/UploadContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const imageSize = (width - 32) / 3;

export default function UploadScreen() {
  const [images, setImages] = useState<MediaLibrary.Asset[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const colorScheme = useColorScheme();
  const { uploading, uploads, setImagesToUpload } = useUpload();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const upload = uploads[0];
  const authContext = useAuth();
  const user = authContext?.user;

  // Show auth modal if user is not authenticated
  useEffect(() => {
    if (!user && !authContext?.isLoading) {
      setShowAuthModal(true);
    }
  }, [user, authContext?.isLoading]);

  useEffect(() => {
    if (user) {
      requestPermissions();
    }
  }, [user]);

  const requestPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to select photos for upload.',
          [{ text: 'OK' }]
        );
        return;
      }

      await loadImages();
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const loadImages = async (after?: string) => {
    if (loadingMore || !hasNextPage) return;

    try {
      setLoadingMore(true);
      let assetsResult;
      assetsResult = await MediaLibrary.getAssetsAsync({
        first: 100,
        after,
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: [MediaLibrary.MediaType.photo],
      });
      
      setImages(prev => (after ? [...prev, ...assetsResult.assets] : assetsResult.assets));
      setHasNextPage(assetsResult.hasNextPage);
      setEndCursor(assetsResult.endCursor);
    } catch (error) {
      console.error('Error loading images:', error);
      Alert.alert('Error', 'Failed to load images from your photo library');
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleSelection = (assetId: string) => {
    setSelectedImages(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(item => item !== assetId);
      }

      if (prev.length >= 3) {
        Alert.alert('Selection limit', 'You can only select up to 3 photos.');
        return prev;
      }

      return [...prev, assetId];
    });
  };

  const handleUpload = () => {
    const selectedAssets = images.filter(img => selectedImages.includes(img.id));
    setImagesToUpload(selectedAssets);
    router.push('/upload/confirmation');
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isSelected = selectedImages.includes(item.id);
    const disabled = !isSelected && selectedImages.length >= 3;

    return (
      <Pressable
        onPress={() => toggleSelection(item.id)}
        style={styles.imageContainer}
        disabled={disabled}
      >
        <Image source={{ uri: item.uri }} style={styles.image} />

        {isSelected && <ThemedView style={styles.selectionOverlay} />}

        {disabled && <ThemedView style={styles.disabledOverlay} />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Select Photos</ThemedText>

        {!user ? (
          <>
            <ThemedView style={styles.permissionContainer}>
              <Ionicons name="cloud-upload-outline" size={80} color={colors.icon} />
              <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                Upload requires authentication
              </ThemedText>
            </ThemedView>
            <AuthModal 
              visible={showAuthModal} 
              onClose={() => setShowAuthModal(false)}
              message="Sign in to upload and share your photos"
            />
          </>
        ) : permissionStatus !== 'granted' ? (
          <ThemedView style={styles.permissionContainer}>
            <ThemedText style={styles.permissionText}>
              Camera roll permission is required to select photos
            </ThemedText>
            <Pressable
              style={[styles.button, styles.uploadButton]}
              onPress={requestPermissions}
            >
              <ThemedText style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].background }]}>
                Grant Permission
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : images.length === 0 ? (
          <ThemedView style={styles.permissionContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.permissionText}>Loading photos...</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={images}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
            onEndReached={() => loadImages(endCursor)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} /> : null}
          />
        )}

        {selectedImages.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.uploadButton,
              uploading && styles.buttonDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleUpload}
            disabled={uploading}
            accessibilityRole="button"
          >
            <ThemedText style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].background }]}>
              {uploading ? `Uploading... ${upload?.progress.toFixed(0)}%` : `Upload ${selectedImages.length} Image(s)`}
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  title: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 16,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    padding: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});