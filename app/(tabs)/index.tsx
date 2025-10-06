import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Dimensions, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';

// Firebase
import { auth, storage } from '@/firebaseConfig';
import { getDownloadURL, listAll, ref } from 'firebase/storage';

const screenWidth = Dimensions.get("window").width;
const columnWidth = screenWidth / 2.3 - 16; // 2 columns with spacing

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPhotos = async () => {
    try {
      const listRef = ref(storage, `photos/${auth?.currentUser?.uid}`);
      const result = await listAll(listRef);
      const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)));
      setPhotos(urls);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [auth?.currentUser?.uid]);

  // Re-fetch when the `refresh` search param changes (used after uploads)
  const searchParams = useLocalSearchParams() as { refresh?: string };
  useEffect(() => {
    if (searchParams?.refresh) {
     onRefresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.refresh]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPhotos();
    setRefreshing(false);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        photos.length > 0 ? (
          <Image
            source={{ uri: photos[0] }}
            style={styles.headerImage}
            contentFit="cover"
          />
        ) : (
          <ThemedView style={styles.headerImage} />
        )
      }
    >
      <ThemedView style={styles.gridContainer}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Recent Uploads
        </ThemedText>

        <FlatList
          data={photos}
          keyExtractor={(item, idx) => item || String(idx)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            photos.length === 0 && styles.emptyContent,
          {gap:10}
          ]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
              <ThemedView style={styles.emptyWrap}>
                <ThemedText type="subtitle" style={{ marginBottom: 12 }}>No photos yet 📷</ThemedText>
                <Pressable style={styles.cta} onPress={() => router.push('/(tabs)/upload')}>
                  <ThemedText style={styles.ctaText}>Upload your first photo</ThemedText>
                </Pressable>
              </ThemedView>
            }
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={[
                styles.photo,
                { width: columnWidth, height: columnWidth }, // square
              ]}
              contentFit="cover"
            />
          )}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: "100%",
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
    gap:10
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    borderRadius: 12,
  },
});
