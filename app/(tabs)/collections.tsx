import React, { useState, useEffect, useCallback } from 'react';
import { SectionList, Image, View, StyleSheet, ActivityIndicator, FlatList, Pressable, TextInput } from 'react-native';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import UploadProgressBar from "@/components/UploadProgressBar";
import SignInPromptModal from '@/components/SignInPromptModal';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiGet, parseApiJson } from '@/utils/api';

const photoSize = 150;
const PAGE_SIZE = 5;

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

type ApiEnvelope<T> = {
  success?: boolean;
  sucess?: boolean;
  data?: T;
  message?: string;
};

function mergeSections(existingSections: Section[], incomingSections: Section[]) {
  const map = new Map<string, PhotoItem[]>();
  existingSections.forEach((section) => map.set(section.title, [...section.data]));
  incomingSections.forEach((section) => {
    const currentItems = map.get(section.title) || [];
    map.set(section.title, [...currentItems, ...section.data]);
  });

  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

const CollectionPhoto = ({ item, index, sectionData }: { item: PhotoItem; index: number; sectionData: PhotoItem[] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      onPress={() => {
        const postId = item.photo.id || '';
        const photosForSection = sectionData;
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
      <Image
        source={{ uri: item.photo.imageUrl }}
        style={styles.photo}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="small" color={colors.tint} />
        </View>
      )}
    </Pressable>
  );
};

export default function CollectionsScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const auth = useAuth();
  const user = auth?.user;
  const isAuthLoading = auth?.isLoading;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fetchCategories = useCallback(async (pageNum: number = 1) => {
    if (!user) return;

    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      const token = await user.getIdToken();
      const response = await apiGet(`/photos/categories?page=${pageNum}&pageSize=${PAGE_SIZE}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        retries: 1,
        timeout: 30000,
      });

      const result = await parseApiJson<ApiEnvelope<Record<string, PhotoItem[]>>>(response);
      if ((result.success || result.sucess) && result.data) {
        const data = result.data;
        const formattedSections: Section[] = Object.keys(data).map((key) => ({
          title: key,
          data: data[key] || [],
        }));

        setSections((prevSections) => (
          pageNum === 1 ? formattedSections : mergeSections(prevSections, formattedSections)
        ));
        setPage(pageNum + 1);
        setHasMore(formattedSections.length === PAGE_SIZE);
      } else if (result && result.message) {
        setError(result.message);
      } else {
        setError('Unexpected response from server');
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
      setError(e instanceof Error ? e.message : 'Failed to fetch categories');
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user && !isAuthLoading) {
      setShowAuthModal(true);
      setLoading(false);
      setSections([]);
      setFilteredSections([]);
      setPage(1);
      setHasMore(true);
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading || !user) return;

    setPage(1);
    setHasMore(true);
    fetchCategories(1);
  }, [fetchCategories, isAuthLoading, user]);

  useEffect(() => {
    setFilteredSections(sections);
  }, [sections]);

  useEffect(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) {
      setFilteredSections(sections);
      return;
    }

    const terms = q.split(/\s+/).filter(Boolean);

    const results: Section[] = sections
      .map((section) => {
        const titleMatches = terms.some((term) => section.title.toLowerCase().includes(term));
        if (titleMatches) {
          return { ...section };
        }

        const filteredData = section.data.filter((item) => {
          const tags = (item.photo.tags || []) as string[];
          const category = (item.photo.category || '').toString().toLowerCase();

          if (terms.some((term) => category.includes(term))) {
            return true;
          }

          return tags.some((tag) => {
            const lower = tag.toLowerCase();
            return terms.some((term) => lower.includes(term));
          });
        });

        if (filteredData.length > 0) {
          return { title: section.title, data: filteredData };
        }

        return null;
      })
      .filter((section): section is Section => section !== null && section.data.length > 0);

    setFilteredSections(results);
  }, [searchQuery, sections]);

  const loadMoreSections = useCallback(() => {
    if (!user || loading || loadingMore || !hasMore) {
      return;
    }

    fetchCategories(page);
  }, [fetchCategories, hasMore, loading, loadingMore, page, user]);

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View>
      <ThemedText type="subtitle" style={styles.sectionHeader}>{section.title}</ThemedText>
      <FlatList
        horizontal
        data={section.data}
        renderItem={({ item, index }: { item: PhotoItem; index: number }) => (
          <CollectionPhoto item={item} index={index} sectionData={section.data} />
        )}
        keyExtractor={(item) => item.photo.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoList}
      />
    </View>
  );

  if (!user && !isAuthLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView style={styles.center}>
          <Ionicons name="images-outline" size={80} color={colors.icon} />
          <ThemedText type="subtitle" style={{ marginTop: 16 }}>
            Sign in to view collections
          </ThemedText>
          <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>
            Browse curated photo collections
          </ThemedText>
        </ThemedView>
        <SignInPromptModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Sign In to View Collections"
          message="Sign in to browse and explore curated photo collections"
        />
      </SafeAreaView>
    );
  }

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={styles.container}>
        <UploadProgressBar />
        <SectionList
          sections={filteredSections}
          keyExtractor={(item, index) => (item.photo?.id || String(index))}
          renderItem={() => null}
          renderSectionHeader={renderSectionHeader}
          onEndReached={loadMoreSections}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
          ListHeaderComponent={
            <ThemedView>
              <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
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
    paddingVertical: 12,
    marginHorizontal: 10,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

