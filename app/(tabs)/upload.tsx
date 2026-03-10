import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, FlatList, Dimensions, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpload } from '../../context/UploadContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import SignInPromptModal from '@/components/SignInPromptModal';
import UploadWelcomeModal from '@/components/UploadWelcomeModal';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const imageSize = (width - 32) / 3;

const UPLOAD_WELCOME_KEY = 'hasSeenUploadWelcome';

type LoadImagesOptions = {
  after?: string;
  album?: MediaLibrary.Album | null;
  reset?: boolean;
};

export default function UploadScreen() {
  const [images, setImages] = useState<MediaLibrary.Asset[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasCheckedWelcome, setHasCheckedWelcome] = useState(false);
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(null);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  
  const colorScheme = useColorScheme();
  const { uploading, uploads, setImagesToUpload } = useUpload();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const upload = uploads[0];
  const authContext = useAuth();
  const user = authContext?.user;

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        const hasSeenWelcome = await AsyncStorage.getItem(UPLOAD_WELCOME_KEY);
        if (!hasSeenWelcome && user) {
          setShowWelcomeModal(true);
        }
        setHasCheckedWelcome(true);
      } catch (error) {
        console.error('Error checking welcome status:', error);
        setHasCheckedWelcome(true);
      }
    };

    if (user) {
      checkWelcomeStatus();
    }
  }, [user]);

  useEffect(() => {
    if (!user && !authContext?.isLoading) {
      setShowAuthModal(true);
    }
  }, [user, authContext?.isLoading]);

  useEffect(() => {
    if (user && hasCheckedWelcome && !showWelcomeModal) {
      requestPermissions();
    }
  }, [user, hasCheckedWelcome, showWelcomeModal]);

  const handleWelcomeClose = async () => {
    try {
      await AsyncStorage.setItem(UPLOAD_WELCOME_KEY, 'true');
      setShowWelcomeModal(false);
    } catch (error) {
      console.error('Error saving welcome status:', error);
      setShowWelcomeModal(false);
    }
  };

  const handleWelcomeContinue = async () => {
    try {
      await AsyncStorage.setItem(UPLOAD_WELCOME_KEY, 'true');
      setShowWelcomeModal(false);
    } catch (error) {
      console.error('Error saving welcome status:', error);
      setShowWelcomeModal(false);
    }
  };

  const loadAlbums = async () => {
    try {
      const albumsResult = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });
      setAlbums(albumsResult);
      console.log(`Found ${albumsResult.length} albums`);
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const loadImages = async ({ after, album = selectedAlbum, reset = false }: LoadImagesOptions = {}) => {
    if (loadingMore || (!reset && !hasNextPage)) return;

    try {
      setLoadingMore(true);
      const assetsResult = await MediaLibrary.getAssetsAsync({
        first: 100,
        after,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        mediaType: [MediaLibrary.MediaType.photo],
        ...(album && { album }),
      });
      
      console.log(`Loaded ${assetsResult.assets.length} images, hasNextPage: ${assetsResult.hasNextPage}`);
      setImages((prev) => (after ? [...prev, ...assetsResult.assets] : assetsResult.assets));
      setHasNextPage(assetsResult.hasNextPage);
      setEndCursor(assetsResult.endCursor);
    } catch (error) {
      console.error('Error loading images:', error);
      Alert.alert('Error', 'Failed to load images from your photo library');
    } finally {
      setLoadingMore(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      setPermissionStatus(status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need full media library access to view all your photos, including downloads and other folders.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (Platform.OS === 'android' && Platform.Version >= 29) {
        try {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
            {
              title: 'Media Location Permission',
              message: 'This app needs access to photo metadata to display your images correctly.',
              buttonPositive: 'OK',
            }
          );
          if (result !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Media location permission denied');
          }
        } catch (err) {
          console.warn('Error requesting media location permission:', err);
        }
      }

      await loadAlbums();
      await loadImages({ reset: true });
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const toggleSelection = (assetId: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(assetId)) {
        return prev.filter((item) => item !== assetId);
      }

      if (prev.length >= 3) {
        Alert.alert('Selection limit', 'You can only select up to 3 photos.');
        return prev;
      }

      return [...prev, assetId];
    });
  };

  const handleUpload = () => {
    const selectedAssets = images.filter((img) => selectedImages.includes(img.id));
    setImagesToUpload(selectedAssets);
    router.push('/upload/confirmation');
  };

  const handleAlbumSelect = async (album: MediaLibrary.Album | null) => {
    setSelectedAlbum(album);
    setShowAlbumPicker(false);
    setImages([]);
    setHasNextPage(true);
    setEndCursor(undefined);
    setSelectedImages([]);
    await loadImages({ album, reset: true });
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset | 'album-selector' }) => {
    if (item === 'album-selector') {
      return (
        <Pressable
          onPress={() => setShowAlbumPicker(true)}
          style={styles.imageContainer}
        >
          <ThemedView style={[styles.image, styles.albumSelectorCell]}>
            <MaterialIcons name="photo-library" size={40} color={colors.tint} />
            <ThemedText style={styles.albumSelectorText}>
              {selectedAlbum ? selectedAlbum.title : 'All Photos'}
            </ThemedText>
          </ThemedView>
        </Pressable>
      );
    }

    const isSelected = selectedImages.includes(item.id);
    const disabled = !isSelected && selectedImages.length >= 3;

    return (
      <Pressable
        onPress={() => toggleSelection(item.id)}
        style={styles.imageContainer}
        disabled={disabled}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item.id}
          allowDownscaling={true}
          priority="normal"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={200}
          onError={(error) => {
            console.warn(`Failed to load image ${item.id}:`, error);
          }}
        />

        {isSelected && (
          <ThemedView style={styles.selectionOverlay}>
            <ThemedView style={styles.checkmarkContainer}>
              <MaterialIcons name="check" size={20} color="#fff" />
            </ThemedView>
          </ThemedView>
        )}

        {disabled && <ThemedView style={styles.disabledOverlay} />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Upload Photos</ThemedText>
          {selectedImages.length > 0 && (
            <ThemedText style={styles.selectedCount}>
              {selectedImages.length} / 3 selected
            </ThemedText>
          )}
        </ThemedView>

        {!user ? (
          <>
            <ThemedView style={styles.permissionContainer}>
              <Ionicons name="cloud-upload-outline" size={80} color={colors.icon} />
              <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                Sign in to upload photos
              </ThemedText>
              <ThemedText style={styles.permissionText}>
                Share your beautiful moments with the Photogram community
              </ThemedText>
            </ThemedView>
            <SignInPromptModal
              visible={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              title="Sign In to Upload"
              message="Sign in to upload and share your photos with the Photogram community"
            />
          </>
        ) : showWelcomeModal ? (
          <>
            <ThemedView style={styles.permissionContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <ThemedText style={styles.permissionText}>Loading...</ThemedText>
            </ThemedView>
            <UploadWelcomeModal
              visible={showWelcomeModal}
              onClose={handleWelcomeClose}
              onContinue={handleWelcomeContinue}
            />
          </>
        ) : permissionStatus !== 'granted' ? (
          <ThemedView style={styles.permissionContainer}>
            <MaterialIcons name="photo-library" size={80} color={colors.icon} />
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
        ) : images.length === 0 && loadingMore ? (
          <ThemedView style={styles.permissionContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.permissionText}>Loading photos...</ThemedText>
          </ThemedView>
        ) : (
          <>
            <FlatList
              data={['album-selector' as const, ...images]}
              renderItem={renderItem}
              keyExtractor={(item) => item === 'album-selector' ? 'album-selector' : item.id}
              numColumns={3}
              contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 100 }}
              onEndReached={() => loadImages({ after: endCursor })}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} /> : null}
            />

            {showAlbumPicker && (
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowAlbumPicker(false)}
              >
                <Pressable style={styles.albumPickerModal} onPress={(e) => e.stopPropagation()}>
                  <ThemedView style={styles.albumPickerContent}>
                    <ThemedText type="subtitle" style={styles.albumPickerTitle}>Select Album</ThemedText>
                    
                    <Pressable
                      onPress={() => handleAlbumSelect(null)}
                      style={[styles.albumItem, !selectedAlbum && styles.albumItemSelected]}
                    >
                      <MaterialIcons name="photo" size={24} color={colors.tint} />
                      <ThemedText style={styles.albumName}>All Photos</ThemedText>
                      {!selectedAlbum && <MaterialIcons name="check" size={20} color={colors.tint} />}
                    </Pressable>

                    <FlatList
                      data={albums}
                      keyExtractor={(album) => album.id}
                      renderItem={({ item: album }) => (
                        <Pressable
                          onPress={() => handleAlbumSelect(album)}
                          style={[styles.albumItem, selectedAlbum?.id === album.id && styles.albumItemSelected]}
                        >
                          <MaterialIcons name="photo-album" size={24} color={colors.tint} />
                          <ThemedText style={styles.albumName}>{album.title}</ThemedText>
                          <ThemedText style={styles.albumCount}>({album.assetCount})</ThemedText>
                          {selectedAlbum?.id === album.id && <MaterialIcons name="check" size={20} color={colors.tint} />}
                        </Pressable>
                      )}
                      style={styles.albumList}
                    />
                  </ThemedView>
                </Pressable>
              </Pressable>
            )}
          </>
        )}

        {selectedImages.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.uploadButton,
              styles.floatingButton,
              uploading && styles.buttonDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleUpload}
            disabled={uploading}
            accessibilityRole="button"
          >
            <MaterialIcons name="cloud-upload" size={24} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].background }]}>
              {uploading ? `Uploading... ${upload?.progress.toFixed(0)}%` : `Upload ${selectedImages.length} Photo${selectedImages.length > 1 ? 's' : ''}`}
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
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  selectedCount: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '600',
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
    opacity: 0.7,
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
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: '#10B981',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  albumSelectorCell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(128, 128, 128, 0.3)',
    gap: 8,
  },
  albumSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumPickerModal: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  albumPickerContent: {
    padding: 20,
    maxHeight: 500,
  },
  albumPickerTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  albumList: {
    maxHeight: 400,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
    marginBottom: 8,
  },
  albumItemSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  albumName: {
    flex: 1,
    fontSize: 16,
  },
  albumCount: {
    fontSize: 14,
    opacity: 0.6,
  },
});