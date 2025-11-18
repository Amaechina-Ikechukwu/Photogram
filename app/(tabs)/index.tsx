import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import PhotoItem from '@/components/PhotoItem';
import { apiGet, apiPost } from '@/utils/api';

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
  hasLiked: boolean;
}

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<PublicPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const authContext = useAuth();
  const user = authContext?.user;

  const fetchPhotos = async (pageNum: number = 1) => {
    if (loading) return;
    if (pageNum > 1 && !hasMore) return;
    
    setLoading(true);
    try {
      const response = await apiGet(`/photos/public?page=${pageNum}&pageSize=10`, {
        retries: 1,
        timeout: 30000
      });
      const result = await response.json();
      

      
      // Check for both 'success' and 'sucess' (typo in API)
      if ((result.success || result.sucess) && result.data) {
        if (result.data.length > 0) {
          if (pageNum === 1) {
            setPhotos(result.data);
          } else {
            setPhotos(prevPhotos => [...prevPhotos, ...result.data]);
          }
          setPage(pageNum + 1);
          
          // If we got fewer items than pageSize, we've reached the end
          if (result.data.length < 10) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } else {
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(1);
  }, []);

  const searchParams = useLocalSearchParams() as { refresh?: string };
  useEffect(() => {
    if (searchParams?.refresh) {
      onRefresh();
    }
  }, [searchParams?.refresh]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setPhotos([]);
    await fetchPhotos(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && photos.length > 0) {

      fetchPhotos(page);
    }
  };

  const onScrollHandler = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 100; // Trigger earlier for better UX
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !loading && hasMore) {
      handleLoadMore();
    }
  };

  const openPhotoDetail = (item: PublicPhoto, index: number) => {
    router.push({
      pathname: `/photo/[id]` as any,
      params: {
        id: item.photo.id || '',
        photos: JSON.stringify(photos),
        index: String(index),
      },
    });
  };

  const renderItem = ({ item, index }: { item: PublicPhoto; index: number }) => {
  
    return (
      <PhotoItem
        item={item}
        index={index}
        onPress={openPhotoDetail}
  onLike={async (photo: PublicPhoto, newLiked: boolean) => {
          // Handle like action: optimistic UI update, call API, revert on failure
          const postId = photo.photo.id;
          if (!postId) return;

          // Save snapshot to revert if needed
          const prevPhotos = photos;

          // Optimistically update UI: set hasLiked and adjust author's totalLikes
          setPhotos((prev) =>
            prev.map((p) => {
              if (p.photo.id === postId) {
                const likesChange = newLiked ? 1 : -1;
                return {
                  ...p,
                  hasLiked: newLiked,
                  user: { ...p.user, totalLikes: (p.user.totalLikes || 0) + likesChange },
                };
              }
              return p;
            })
          );

          try {
            const token = await user?.getIdToken();
            const res = await apiPost(`/like/toggle/${postId}`, {
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              retries: 1,
              timeout: 15000
            });

            const result = await res.json();

            // If API responds with explicit hasLiked, ensure UI matches server
            if (result && typeof result.hasLiked === 'boolean') {
              setPhotos((prev) =>
                prev.map((p) => (p.photo.id === postId ? { ...p, hasLiked: result.hasLiked } : p))
              );

              // If server doesn't return updated totalLikes, keep optimistic change.
            } else if (!(result && (result.success || result.sucess))) {
              // Unexpected response: revert
              console.error('Like toggle API unexpected response:', result);
              setPhotos(prevPhotos);
            }
          } catch (err) {
            console.error('Error toggling like:', err);
            // Revert optimistic update
            setPhotos(prevPhotos);
          }
        }}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.titleContainer}>
      <ThemedText type="title" style={styles.sectionTitle}>
        Recents
      </ThemedText>
      
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].text} />
        <ThemedText style={{ marginTop: 8 }}>Loading more...</ThemedText>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <ThemedView style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText style={{ marginTop: 12 }}>Loading photos...</ThemedText>
        </ThemedView>
      );
    }
    
    return (
      <ThemedView style={styles.emptyWrap}>
        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
          {user ? 'No photos yet 📷' : 'Welcome to Photogram 📷'}
        </ThemedText>
        {!user && (
          <Pressable
            style={[styles.cta, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText style={[styles.ctaText, { color: Colors[colorScheme ?? 'light'].background }]}>
              {'Sign in to view photos'}
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          photos.length > 0 ? (
            <Image
              source={{ uri: photos[0].photo.imageUrl }}
              style={styles.headerImage}
              contentFit="cover"
            />
          ) : (
            <ThemedView style={styles.headerImage} />
          )
        }
        onScroll={onScrollHandler}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <ThemedView style={styles.gridContainer}>
          {renderHeader()}
          
          {photos.length === 0 && renderEmpty()}
          
          {photos.map((item, index) => (
            <View key={`${item.photo.id}-${index}`}>
              {renderItem({ item, index })}
            </View>
          ))}
          
          {renderFooter()}
        </ThemedView>
      </ParallaxScrollView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    height: '100%',
    width: '100%',
  },
  gridContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    marginLeft: 8,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  cta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: {
    fontWeight: '600',
  },
  photoListContainer: {
    paddingHorizontal: 8,
    gap: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  reloadButton: {
    padding: 8,
  },
  loadingMore: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
 
});
