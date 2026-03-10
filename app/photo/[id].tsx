import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Pressable, View, Animated, FlatList, Dimensions, ScrollView, PanResponder, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { apiGet, apiPost } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

type PhotoRouteParams = {
  id?: string | string[];
  photos?: string | string[];
  index?: string | string[];
};

type TimerRef = ReturnType<typeof setTimeout>;

interface PhotoData {
  uid: string;
  imageUrl: string;
  category: string | null;
  tags: string[] | null;
  createdAt: number;
  id: string | null;
}
  
interface UserData {
  name: string | null;
  uid: string;
  email: string;
  numberOfUploads: number;
  totalViews: number;
  totalLikes: number;
}

interface PublicPhoto {
  photo: PhotoData;
  user: UserData;
  hasLiked?: boolean;
}

const getRouteParam = (param?: string | string[]) => (
  Array.isArray(param) ? param[0] : param
);

const normalizePublicPhoto = (value: unknown): PublicPhoto | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Record<string, any>;
  if (item.photo && item.user) {
    return item as PublicPhoto;
  }

  if (item.imageUrl && item.user) {
    return {
      photo: {
        uid: item.uid ?? item.user.uid ?? '',
        imageUrl: item.imageUrl,
        category: item.category ?? null,
        tags: item.tags ?? null,
        createdAt: item.createdAt ?? Date.now(),
        id: item.id ?? null,
      },
      user: item.user,
      hasLiked: item.hasLiked,
    };
  }

  return null;
};

const parsePhotosParam = (photosParam?: string) => {
  if (!photosParam) {
    return [];
  }

  try {
    const parsed = JSON.parse(photosParam);
    const parsedArray = Array.isArray(parsed) ? parsed : [parsed];
    return parsedArray
      .map((item) => normalizePublicPhoto(item))
      .filter((item): item is PublicPhoto => item !== null);
  } catch (error) {
    console.error('Failed to parse photo payload:', error);
    return [];
  }
};

const fetchPhotoById = async (photoId: string, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  for (const endpoint of [`/photos/${photoId}`, `/photos/public/${photoId}`]) {
    try {
      const response = await apiGet(endpoint, {
        headers,
        retries: 1,
        timeout: 15000,
      });

      if (!response.ok) {
        if (response.status === 404) {
          continue;
        }
        return null;
      }

      const result = await response.json().catch(() => null);
      const normalizedPhoto = normalizePublicPhoto(result?.data ?? result);
      if (normalizedPhoto) {
        return normalizedPhoto;
      }
    } catch (error) {
      console.error(`Failed to fetch photo from ${endpoint}:`, error);
    }
  }

  return null;
};

const incrementViewCount = async (photoId: string) => {
  try {
    await apiPost(`/photos/${photoId}/view`, {
      headers: {
        'Content-Type': 'application/json',
      },
      retries: 1,
      timeout: 15000,
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

function PhotoPage({ photo, user }: PublicPhoto) {
  const [overlayVisible, setOverlayVisible] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const autoHideTimerRef = useRef<TimerRef | null>(null);

  const hideOverlay = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }

    setOverlayVisible(false);
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [overlayOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            router.back();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const parsedTags = photo.tags || [];
  const formattedDate = photo.createdAt
    ? new Date(Number(photo.createdAt)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown date';

  const toggleOverlay = () => {
    const newVisibility = !overlayVisible;
    setOverlayVisible(newVisibility);

    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }

    Animated.timing(overlayOpacity, {
      toValue: newVisibility ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (newVisibility) {
      autoHideTimerRef.current = setTimeout(() => {
        hideOverlay();
      }, 5000);
    }
  };

  useEffect(() => {
    autoHideTimerRef.current = setTimeout(() => {
      hideOverlay();
    }, 5000);

    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [hideOverlay]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar hidden />
      <Animated.View
        style={[
          styles.imageContainer,
          { transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable style={styles.imagePressable} onPress={toggleOverlay}>
          <Image
            source={{ uri: photo.imageUrl as string }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            recyclingKey={photo.imageUrl as string}
            allowDownscaling={true}
            priority="high"
          />
        </Pressable>
      </Animated.View>

      <Animated.View
        pointerEvents={overlayVisible ? 'auto' : 'none'}
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <SafeAreaView edges={['bottom']} style={styles.bottomInfoWrapper}>
          <BlurView intensity={90} tint="dark" style={styles.compactInfoContainer}>
            <View style={styles.compactUserRow}>
              <View style={styles.compactUserAvatar}>
                <ThemedText style={styles.compactAvatarText}>
                  {((user.name || (user as any).Name) || 'A').charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.compactUserDetails}>
                <ThemedText type="defaultSemiBold" style={styles.compactUserName}>
                  {user.name || (user as any).Name || 'Anonymous'}
                </ThemedText>
                <ThemedText style={styles.compactUserEmail}>
                  {user.email || (user as any).Email}
                </ThemedText>
              </View>
            </View>

            <View style={styles.compactStatsRow}>
              <View style={styles.compactStatItem}>
                <Ionicons name="images-outline" size={16} color={Colors.dark.tint} />
                <ThemedText style={styles.compactStatValue}>{user.numberOfUploads || (user as any).NumberOfUploads || 0}</ThemedText>
              </View>
              <View style={styles.compactStatItem}>
                <Ionicons name="eye-outline" size={16} color={Colors.dark.tint} />
                <ThemedText style={styles.compactStatValue}>{user.totalViews || (user as any).TotalViews || 0}</ThemedText>
              </View>
              <View style={styles.compactStatItem}>
                <Ionicons name="heart-outline" size={16} color={Colors.dark.tint} />
                <ThemedText style={styles.compactStatValue}>{user.totalLikes || (user as any).TotalLikes || 0}</ThemedText>
              </View>
              <View style={styles.compactDivider} />
              <ThemedText style={styles.compactInfoText}>{photo.category || 'N/A'}</ThemedText>
              <View style={styles.compactDivider} />
              <ThemedText style={styles.compactInfoText}>{formattedDate}</ThemedText>
            </View>

            {parsedTags.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.compactTagsScroll}
              >
                <View style={styles.compactTagsRow}>
                  {parsedTags.map((tag: string, index: number) => (
                    <View key={index} style={styles.compactTag}>
                      <ThemedText style={styles.compactTagText}>{tag}</ThemedText>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </BlurView>
        </SafeAreaView>
      </Animated.View>
    </ThemedView>
  );
}

export default function PhotoDetailScreen() {
  const { user } = useAuth() || {};
  const params = useLocalSearchParams<PhotoRouteParams>();
  const photoId = getRouteParam(params.id);
  const photosString = getRouteParam(params.photos);
  const requestedIndex = Number(getRouteParam(params.index) ?? 0);
  const initialPhotos = useMemo(() => parsePhotosParam(photosString), [photosString]);
  const [photos, setPhotos] = useState<PublicPhoto[]>(initialPhotos);
  const [loadingPhoto, setLoadingPhoto] = useState(initialPhotos.length === 0 && Boolean(photoId));
  const [loadError, setLoadError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<PublicPhoto>>(null);
  const viewedPhotosRef = useRef(new Set<string>());

  useEffect(() => {
    if (initialPhotos.length > 0) {
      setPhotos(initialPhotos);
      setLoadingPhoto(false);
      setLoadError(null);
      return;
    }

    if (!photoId) {
      setPhotos([]);
      setLoadingPhoto(false);
      setLoadError('Photo not found.');
      return;
    }

    let isCancelled = false;

    const loadPhoto = async () => {
      setLoadingPhoto(true);
      setLoadError(null);
      const token = await user?.getIdToken();
      const resolvedPhoto = await fetchPhotoById(photoId, token);

      if (isCancelled) {
        return;
      }

      if (resolvedPhoto) {
        setPhotos([resolvedPhoto]);
      } else {
        setPhotos([]);
        setLoadError('This photo is unavailable.');
      }

      setLoadingPhoto(false);
    };

    loadPhoto();

    return () => {
      isCancelled = true;
    };
  }, [initialPhotos, photoId, user]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    viewableItems.forEach((viewableItem: any) => {
      const currentPhotoId = viewableItem.item.photo.id;
      if (currentPhotoId && !viewedPhotosRef.current.has(currentPhotoId)) {
        viewedPhotosRef.current.add(currentPhotoId);
        incrementViewCount(currentPhotoId);
      }
    });
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
  }).current;

  const renderItem = ({ item }: { item: PublicPhoto }) => (
    <View style={{ width: screenWidth }}>
      <PhotoPage {...item} />
    </View>
  );

  const initialIndex = photos.length === 0
    ? 0
    : Math.min(Math.max(Number.isFinite(requestedIndex) ? requestedIndex : 0, 0), photos.length - 1);

  if (loadingPhoto) {
    return (
      <ThemedView style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.dark.tint} />
        <ThemedText style={styles.loadingText}>Loading photo...</ThemedText>
      </ThemedView>
    );
  }

  if (photos.length === 0) {
    return (
      <ThemedView style={styles.loadingState}>
        <ThemedText type="subtitle" style={styles.loadingText}>{loadError || 'Photo unavailable.'}</ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={photos}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.photo.id || item.photo.imageUrl}-${index}`}
      horizontal
      pagingEnabled
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
      showsHorizontalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePressable: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  bottomInfoWrapper: {
    width: '100%',
  },
  compactInfoContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  compactUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  compactUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  compactAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  compactUserDetails: {
    flex: 1,
  },
  compactUserName: {
    fontSize: 14,
    color: 'white',
  },
  compactUserEmail: {
    fontSize: 11,
    color: 'white',
    opacity: 0.7,
    marginTop: 1,
  },
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  compactStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  compactDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  compactInfoText: {
    fontSize: 11,
    color: 'white',
    opacity: 0.8,
  },
  compactTagsScroll: {
    marginTop: 8,
    marginBottom: 4,
  },
  compactTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  compactTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.dark.tint + '20',
  },
  compactTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.dark.tint,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.dark.tint,
  },
  backButtonText: {
    color: '#000',
    fontWeight: '700',
  },
});