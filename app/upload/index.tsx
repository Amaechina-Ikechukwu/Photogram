import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, FlatList, Dimensions, Alert, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/firebaseConfig';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const imageSize = (width - 32) / 3;

export default function UploadScreen() {
  const [images, setImages] = useState<MediaLibrary.Asset[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    requestPermissions();
  }, []);

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

  const loadImages = async () => {
    try {
      const albums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
      const cameraRoll = albums.find(album => album.title === 'Camera Roll' || album.title === 'Recents');

      let assets;
      if (cameraRoll) {
        const result = await MediaLibrary.getAssetsAsync({
          album: cameraRoll,
          first: 50,
          sortBy: [MediaLibrary.SortBy.creationTime],
          mediaType: [MediaLibrary.MediaType.photo],
        });
        assets = result.assets;
      } else {
        const result = await MediaLibrary.getAssetsAsync({
          first: 50,
          sortBy: [MediaLibrary.SortBy.creationTime],
          mediaType: [MediaLibrary.MediaType.photo],
        });
        assets = result.assets;
      }
      
      setImages(assets);
    } catch (error) {
      console.error('Error loading images:', error);
      Alert.alert('Error', 'Failed to load images from your photo library');
    }
  };

  const toggleSelection = (assetId: string) => {
    setSelectedImages(prev => {
      // If already selected, unselect
      if (prev.includes(assetId)) {
        return prev.filter(item => item !== assetId);
      }

      // Prevent selecting more than 3 images
      if (prev.length >= 3) {
        Alert.alert('Selection limit', 'You can only select up to 3 photos.');
        return prev;
      }

      return [...prev, assetId];
    });
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return;

    if (!auth?.currentUser?.uid) {
      Alert.alert('Error', 'You must be logged in to upload photos');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = selectedImages.map(async (assetId, index) => {
        const filename = `photos/${auth.currentUser!.uid}/${Date.now()}-${index}.jpg`;
        const storageRef = ref(storage, filename);

        // Get the asset info to access the actual file
        const asset = images.find(img => img.id === assetId);
        if (!asset) {
          throw new Error('Asset not found');
        }

        // Get the asset info with local URI
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
        if (!assetInfo.localUri && !assetInfo.uri) {
          throw new Error('Could not access asset URI');
        }

        const uri = assetInfo.localUri || assetInfo.uri;
        const response = await fetch(uri);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(storageRef, blob);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            snapshot => {
              const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              // Update progress based on the average of all uploads
              if (index === 0) setProgress(prog);
            },
            error => {
              console.error('Upload failed:', error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Upload successful:', downloadURL);
                resolve(downloadURL);
              } catch (error) {
                console.error('Error getting download URL:', error);
                reject(error);
              }
            }
          );
        });
      });

      await Promise.all(uploadPromises);
      
      Alert.alert(
        'Success!', 
        `Successfully uploaded ${selectedImages.length} image(s)`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedImages([]);
              setProgress(0);
              router.push(`/(tabs)?refresh=${Date.now()}`);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed', 
        'There was an error uploading your photos. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
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

        {/* Subtle overlay to indicate disabled/select limit reached */}
        {disabled && <ThemedView style={styles.disabledOverlay} />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Select Photos</ThemedText>

        {permissionStatus !== 'granted' ? (
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
            onPress={uploadImages}
            disabled={uploading}
            accessibilityRole="button"
          >
            <ThemedText style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].background }]}>
              {uploading ? `Uploading... ${progress.toFixed(0)}%` : `Upload ${selectedImages.length} Image(s)`}
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
    borderWidth: 3,
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