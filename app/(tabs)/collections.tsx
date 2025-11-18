import React, { useState, useEffect } from 'react';
import { SectionList, Image, View, StyleSheet, ActivityIndicator, Dimensions, FlatList, Pressable, TextInput } from 'react-native';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import UploadProgressBar from "@/components/UploadProgressBar";
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiGet } from '@/utils/api';

const { width } = Dimensions.get('window');
const photoSize = 150;

interface Photo {
  id: string;
  uid: string;
  imageUrl: string;
  category: string;
  tags: string[] | null;
  createdAt: number;
  views: number;
  likes: number;
}

interface User {
  name: string | null;
  uid: string;
  email: string;
  numberOfUploads: number;
  totalViews: number;
  totalLikes: number;
}

interface PhotoItem {
  photo: Photo;
  user: User;
  hasLiked: boolean;
}

interface Section {
  title: string;
  data: PhotoItem[];
}

export default function CollectionsScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchCategories = async (pageNum: number = 1) => {
      try {
        const token = await user?.getIdToken();
        const response = await apiGet(`/photos/categories?page=${pageNum}&pageSize=${pageSize}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          retries: 1,
          timeout: 30000
        });
        const result = await response.json();

        // Accept both 'success' and misspelled 'sucess' from API
        if ((result.success || result.sucess) && result.data) {
          const data = result.data as Record<string, PhotoItem[]>;
          const formattedSections: Section[] = Object.keys(data).map((key) => ({
            title: key,
            data: data[key] || [],
          }));

          // If first page, replace, otherwise append for each category (merge by title)
          if (pageNum === 1) {
            setSections(formattedSections);
          } else {
            // Merge incoming sections into existing sections by title
            setSections((prev) => {
              const map = new Map<string, PhotoItem[]>();
              prev.forEach((s) => map.set(s.title, [...s.data]));
              formattedSections.forEach((s) => {
                const existing = map.get(s.title) || [];
                map.set(s.title, [...existing, ...s.data]);
              });
              return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
            });
          }

          // Pagination: if any category returned fewer than pageSize, we might be at the end
          // (API semantics may vary; this is a conservative approach)
          const allCounts = Object.values(data).reduce((acc, arr) => acc + (arr?.length || 0), 0);
          if (allCounts < pageSize) {
            setHasMore(false);
          }
        } else if (result && result.message) {
          setError(result.message);
        } else {
          setError('Unexpected response from server');
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories(page);
  }, []);
   const colorScheme = useColorScheme();
      const colors = Colors[colorScheme ?? 'light'];

  // Keep filteredSections synced with sections by default
  useEffect(() => {
    setFilteredSections(sections);
  }, [sections]);

  // Filter sections and photos by category title and photo tags
  useEffect(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) {
      setFilteredSections(sections);
      return;
    }

    const terms = q.split(/\s+/).filter(Boolean);

    const results: Section[] = sections
      .map((section) => {
        // If the section title matches any term, include the whole section
        const titleMatches = terms.some((t) => section.title.toLowerCase().includes(t));

        if (titleMatches) return { ...section };

        // Otherwise filter the photos in the section by tags matching any term
        const filteredData = section.data.filter((item) => {
          const tags = (item.photo.tags || []) as string[];
          // also match category field on photo if present
          const category = (item.photo.category || '').toString().toLowerCase();

          // If category matches any term, include
          if (terms.some((t) => category.includes(t))) return true;

          return tags.some((tag) => {
            const lower = tag.toLowerCase();
            return terms.some((t) => lower.includes(t));
          });
        });

        if (filteredData.length > 0) {
          return { title: section.title, data: filteredData };
        }

        return null;
      })
      .filter((s): s is Section => s !== null && s.data && s.data.length > 0);

    setFilteredSections(results);
  }, [searchQuery, sections]);

  // renderItem is defined inside renderSectionHeader so it can capture section context

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View>
      <ThemedText type="subtitle" style={styles.sectionHeader}>{section.title}</ThemedText>
      {/* Render photos for this section; tapping opens the full-screen photo detail */}
      <FlatList
        horizontal
        data={section.data}
        renderItem={({ item, index }: { item: PhotoItem; index: number }) => (
          <Pressable
            onPress={() => {
              const postId = item.photo.id || '';
              // Pass the photos (including user info) from this section so the detail screen can allow swiping within the section
              const photosForSection = section.data; // Section already contains PhotoItem objects ({ photo, user, hasLiked })
              router.push({
                pathname: `/photo/[id]` as any,
                params: {
                  id: postId,
                  photos: JSON.stringify(photosForSection),
                  index: String(index),
                },
              });
            }}
            style={styles.photoContainer}
          >
            <Image source={{ uri: item.photo.imageUrl }} style={styles.photo} />
          </Pressable>
        )}
        keyExtractor={(item) => item.photo.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoList}
      />
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background  }}>
      <ThemedView style={styles.container}>
        <UploadProgressBar />
        <SectionList
          sections={filteredSections}
          keyExtractor={(item, index) => (item.photo?.id || String(index))}
          renderItem={() => null}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={
            <ThemedView>
              <View style={[styles.searchContainer, { backgroundColor: colors.background }] }>
                <View style={styles.searchInner}>
                  <Ionicons name="search" size={18} color={colors.icon} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search categories or tags..."
                    placeholderTextColor={colors.icon}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color={colors.icon} />
                    </Pressable>
                  )}
                </View>
              </View>
              <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                  Collections
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Browse and organize your photo collections
                </ThemedText>
              </ThemedView>
            </ThemedView>
          }
          ListEmptyComponent={() => (
            <ThemedView style={styles.center}>
              <ThemedText>No matching results</ThemedText>
            </ThemedView>
          )}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionHeader: {
    // paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal:10
  },
  photoList: {
    paddingHorizontal: 16,
  },
  photoContainer: {
    width: photoSize,
    height: photoSize,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});
