import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

// Firebase
import { app } from '@/firebaseConfig';
import { getDownloadURL, getStorage, listAll, ref } from 'firebase/storage';

const screenWidth = Dimensions.get("window").width;
const columnWidth = screenWidth / 2 - 12; // padding for spacing

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const storage = getStorage(app);
        const listRef = ref(storage, 'photos/');
        const result = await listAll(listRef);

        const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)));
        setPhotos(urls);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, []);

  if (photos.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle">No photos yet 📷</ThemedText>
      </ThemedView>
    );
  }

  // Separate photos into two columns
  const leftColumn: string[] = [];
  const rightColumn: string[] = [];
  photos.slice(1).forEach((url, index) => {
    if (index % 2 === 0) {
      leftColumn.push(url);
    } else {
      rightColumn.push(url);
    }
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={{ uri: photos[0] }}
          style={styles.headerImage}
          contentFit="cover"
        />
      }
    >
      <ThemedView style={styles.gridContainer}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Recent Uploads
        </ThemedText>

        <ScrollView contentContainerStyle={styles.masonryContainer}>
          <View style={styles.column}>
            {leftColumn.map((url, idx) => (
              <Image
                key={`left-${idx}`}
                source={{ uri: url }}
                style={[styles.photo, { height: 150 + (idx % 3) * 40 }]} // variable heights for "bento" feel
                contentFit="cover"
              />
            ))}
          </View>

          <View style={styles.column}>
            {rightColumn.map((url, idx) => (
              <Image
                key={`right-${idx}`}
                source={{ uri: url }}
                style={[styles.photo, { height: 150 + (idx % 2) * 60 }]}
                contentFit="cover"
              />
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 220,
    width: '100%',
  },
  gridContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    marginLeft: 8,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  photo: {
    width: columnWidth,
    borderRadius: 12,
    marginBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
