
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Pressable, View, Animated, FlatList, Dimensions, ScrollView, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { apiPost } from '@/utils/api';

const { width: screenWidth } = Dimensions.get('window');

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
}

// Function to increment view count
const incrementViewCount = async (photoId: string) => {
  try {
    const response = await apiPost(`/photos/${photoId}/view`, {
      headers: {
        'Content-Type': 'application/json',
      },
      retries: 1,
      timeout: 15000
    });
    
    if (response.ok) {
      // Try to parse JSON, but handle empty responses
      const text = await response.text();
      if (text) {
        try {
          const data = JSON.parse(text);
       
        } catch (e) {
        
        }
      } else {
   
      }
    } else {
    
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

function PhotoPage({ photo, user }: PublicPhoto) {
    const [overlayVisible, setOverlayVisible] = useState(true);
    const overlayOpacity = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const autoHideTimer = useRef<NodeJS.Timeout | null>(null);
  
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only respond to vertical swipes (down)
          return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 100 || gestureState.vy > 0.5) {
            // Swipe down detected - navigate back
            Animated.timing(translateY, {
              toValue: 500,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              router.back();
            });
          } else {
            // Reset position
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;
  

    const parsedTags = photo.tags ? photo.tags : [];
    const formattedDate = photo.createdAt
      ? new Date(Number(photo.createdAt)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown date';
  
    const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  
    const hideOverlay = () => {
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
    };
  
    const toggleOverlay = () => {
      const newVisibility = !overlayVisible;
      setOverlayVisible(newVisibility);
      
      // Clear existing timer
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
      
      Animated.timing(overlayOpacity, {
        toValue: newVisibility ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Start new timer if showing overlay
      if (newVisibility) {
        autoHideTimerRef.current = setTimeout(() => {
          hideOverlay();
        }, 5000);
      }
    };
  
    useEffect(() => {
      // Initial auto-hide timer
      autoHideTimerRef.current = setTimeout(() => {
        hideOverlay();
      }, 5000);
      
      return () => {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
      };
    }, []);
    
        return (
          <ThemedView style={styles.container}>
            <StatusBar hidden />
            <Animated.View 
              style={[
                styles.imageContainer, 
                { transform: [{ translateY }] }
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
                  transform: [{ translateY }]
                }
              ]}
            >
            <SafeAreaView edges={['bottom']} style={styles.bottomInfoWrapper}>
              <BlurView intensity={90} tint="dark" style={styles.compactInfoContainer}>
                {/* User Info Row */}
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
    
                {/* Stats Row */}
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
    
                {/* Tags Row */}
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
    const params = useLocalSearchParams();
    const { photos: photosString, index } = params;
    const photos: PublicPhoto[] = JSON.parse(photosString as string);
    const initialIndex = Number(index);

    const flatListRef = useRef<FlatList<PublicPhoto>>(null);
    const viewedPhotos = useRef(new Set<string>()).current;

    // Handle viewability changes to increment view count only for visible photos
    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
      viewableItems.forEach((viewableItem: any) => {
        const photoId = viewableItem.item.photo.id;
        if (photoId && !viewedPhotos.has(photoId)) {
          viewedPhotos.add(photoId);
          incrementViewCount(photoId);
        }
      });
    }, []);

    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 500, // Wait 500ms before considering it viewed
    }).current;

    const renderItem = ({ item }: { item: PublicPhoto }) => (
        <View style={{ width: screenWidth }}>
          <PhotoPage {...item} />
        </View>
    );

    return (
        <FlatList
            ref={flatListRef}
            data={photos}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.photo.id || item.photo.imageUrl}-${index}`}
            horizontal
            pagingEnabled
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => (
                { length: screenWidth, offset: screenWidth * index, index }
            )}
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
        />
    )
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
  });
