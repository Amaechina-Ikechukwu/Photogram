
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View, ScrollView, TextInput, TouchableOpacity, useColorScheme, Animated, Keyboard, KeyboardAvoidingView, Platform, Modal, FlatList } from "react-native";
import ImageViewing from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import GlassBackground from "@/components/ui/GlassBackground";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import UploadProgressBar from "@/components/UploadProgressBar";
import AuthModal from "@/components/AuthModal";

type UserProfile = {
    name: string | null;
    uid: string;
    email: string;
    numberOfUploads: number;
    totalViews: number;
    totalLikes: number;
};

type Photo = {
    id: string;
    createdAt: number;
    imageUrl: string;
    tags: string[];
    uid: string;
};



export default function ProfileScreen() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchAnimation = useState(new Animated.Value(0))[0];
    const keyboardHeight = useState(new Animated.Value(0))[0];
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const modalAnimation = useState(new Animated.Value(0))[0];
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const authContext = useAuth();
    const user = authContext?.user;
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        if (!user && !authContext?.isLoading) {
            setShowAuthModal(true);
        } else if (user) {
            fetchProfile();
            fetchPhotos(1);
        }
    }, [user, authContext?.isLoading]);

    const fetchProfile = async () => {
        if (user) {
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                if (result.success) {
                    setProfile(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        }
    };

    const fetchPhotos = async (pageNum: number) => {
        if (user && !loadingMore) {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/photos?page=${pageNum}&pageSize=10`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
   ;
                if (result.success) {
                    if (result.data.length > 0) {
                        const newPhotos = pageNum === 1 ? result.data : [...photos, ...result.data];
                      
                        setPhotos(newPhotos);
                        setFilteredPhotos(newPhotos);
                        setPage(pageNum + 1);
                    } else {
                        setHasMore(false);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch photos:", error);
            } finally {
                if (pageNum === 1) setLoading(false);
                else setLoadingMore(false);
            }
        }
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchPhotos(page);
        }
    };

    // Keyboard event listeners
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardHeight, {
                    toValue: e.endCoordinates.height,
                    duration: Platform.OS === 'ios' ? e.duration : 250,
                    useNativeDriver: false,
                }).start();
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            (e) => {
                Animated.timing(keyboardHeight, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? e.duration : 250,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    // Toggle search bar expansion
    const toggleSearch = () => {
        const toValue = isSearchExpanded ? 0 : 1;
        
        Animated.spring(searchAnimation, {
            toValue,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();

        if (isSearchExpanded) {
            // Closing search
            setSearchQuery('');
            Keyboard.dismiss();
        }
        
        setIsSearchExpanded(!isSearchExpanded);
    };

    // Advanced search algorithm using fuzzy matching and relevance scoring
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPhotos(photos);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const searchTerms = query.split(/\s+/); // Split by whitespace

        const scoredPhotos = photos.map(photo => {
            let score = 0;
            const photoTags = photo.tags.map(tag => tag.toLowerCase());

            searchTerms.forEach(term => {
                photoTags.forEach(tag => {
                    // Exact match
                    if (tag === term) {
                        score += 100;
                    }
                    // Starts with search term
                    else if (tag.startsWith(term)) {
                        score += 50;
                    }
                    // Contains search term
                    else if (tag.includes(term)) {
                        score += 25;
                    }
                    // Fuzzy match (Levenshtein-like)
                    else {
                        const similarity = calculateSimilarity(term, tag);
                        if (similarity > 0.6) {
                            score += Math.floor(similarity * 20);
                        }
                    }
                });
            });

            return { photo, score };
        });

        // Filter and sort by relevance
        const filtered = scoredPhotos
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.photo);

        setFilteredPhotos(filtered);
    }, [searchQuery, photos]);

    // Simple similarity calculation (Dice Coefficient)
    const calculateSimilarity = (str1: string, str2: string): number => {
        if (str1.length < 2 || str2.length < 2) return 0;

        const bigrams1 = new Set<string>();
        const bigrams2 = new Set<string>();

        for (let i = 0; i < str1.length - 1; i++) {
            bigrams1.add(str1.substring(i, i + 2));
        }

        for (let i = 0; i < str2.length - 1; i++) {
            bigrams2.add(str2.substring(i, i + 2));
        }

        const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
        return (2 * intersection.size) / (bigrams1.size + bigrams2.size);
    };

    const openModal = (index: number) => {
        setSelectedImageIndex(index);
        setIsModalVisible(true);
        Animated.timing(modalAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(modalAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setIsModalVisible(false));
    };

    if (loading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <>
                <ThemedView style={styles.centered}>
                    <Ionicons name="person-circle-outline" size={80} color={colors.icon} />
                    <ThemedText type="subtitle" style={{ marginTop: 16 }}>
                        Profile requires authentication
                    </ThemedText>
                </ThemedView>
                <AuthModal 
                    visible={showAuthModal} 
                    onClose={() => setShowAuthModal(false)}
                    message="Sign in to view your profile and manage your photos"
                />
            </>
        );
    }

    if (!profile) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText>Could not load profile.</ThemedText>
                <TouchableOpacity onPress={() => { fetchProfile(); fetchPhotos(1); }} style={styles.retryButton}>
                    <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <SafeAreaView style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
            <ThemedView style={styles.container}>
                <UploadProgressBar />
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${profile.name ?? profile.email}` }}
                        style={styles.profileImage}
                    />
                    <ThemedText style={styles.profileName}>{profile.name || 'Anonymous'}</ThemedText>
                    <ThemedText style={styles.profileEmail}>{profile.email}</ThemedText>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statValue}>{profile.numberOfUploads}</ThemedText>
                        <ThemedText style={styles.statLabel}>Uploads</ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statValue}>{profile.totalViews}</ThemedText>
                        <ThemedText style={styles.statLabel}>Views</ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statValue}>{profile.totalLikes}</ThemedText>
                        <ThemedText style={styles.statLabel}>Likes</ThemedText>
                    </View>
                </View>

                {filteredPhotos.length === 0 && searchQuery.length > 0 && (
                    <View style={styles.noResultsContainer}>
                        <Ionicons name="image-outline" size={48} color={colors.icon} />
                        <ThemedText style={styles.noResultsText}>No photos found</ThemedText>
                        <ThemedText style={styles.noResultsSubtext}>Try different search terms</ThemedText>
                    </View>
                )}

                <FlatList
                    data={filteredPhotos}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    key={'flatlist-3-columns'}
                    columnWrapperStyle={styles.columnWrapper}
                    renderItem={({ item, index }) => {
                     
                        return (
                            <TouchableOpacity 
                                style={styles.imageWrapper}
                                onPress={() => openModal(filteredPhotos.findIndex(p => p.id === item.id))}
                            >
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.gridImage}
                                    resizeMode="cover"
                                    onError={(error) => {
                                        console.error("Image load error for:", item.imageUrl, error.nativeEvent);
                                    }}
                                    onLoad={() => {
                                     
                                    }}
                                />
                            </TouchableOpacity>
                        );
                    }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
                    contentContainerStyle={[styles.masonryContainer, filteredPhotos.length === 0 && { flex: 1 }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !loading && searchQuery.length === 0 ? (
                            <View style={styles.noResultsContainer}>
                                <Ionicons name="images-outline" size={64} color={colors.icon} />
                                <ThemedText style={styles.noResultsText}>No photos yet</ThemedText>
                                <ThemedText style={styles.noResultsSubtext}>Upload some photos to see them here</ThemedText>
                            </View>
                        ) : null
                    }
                />

                {/* Floating Search Button with Glass Background */}
                <Animated.View 
                    style={[
                        styles.floatingSearchContainer,
                        {
                            width: searchAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [60, 280],
                            }),
                            height: searchAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [60, 50],
                            }),
                            borderRadius: searchAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 25],
                            }),
                            bottom: Animated.add(keyboardHeight, 20),
                        }
                    ]}
                >
                    <GlassBackground style={styles.floatingSearchGlass}>
                        {!isSearchExpanded ? (
                            <TouchableOpacity 
                                style={styles.searchFab}
                                onPress={toggleSearch}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="search" size={24} color={colors.text} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.expandedSearchContent}>
                                <Ionicons 
                                    name="search" 
                                    size={20} 
                                    color={colors.icon} 
                                    style={styles.searchIconExpanded} 
                                />
                                <TextInput
                                    style={[styles.searchInputExpanded, { color: colors.text }]}
                                    placeholder="Search by tags..."
                                    placeholderTextColor={colors.icon}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={toggleSearch}>
                                    <Ionicons 
                                        name="close-circle" 
                                        size={22} 
                                        color={colors.icon} 
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </GlassBackground>
                </Animated.View>

                <Modal
                    visible={isModalVisible}
                    transparent
                    onRequestClose={closeModal}
                >
                    <ImageViewing
                        images={filteredPhotos.map(p => ({ uri: p.imageUrl }))}
                        imageIndex={selectedImageIndex}
                        visible={isModalVisible}
                        onRequestClose={closeModal}
                        HeaderComponent={() => (
                            <SafeAreaView>
                                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                    <Ionicons name="close" size={30} color="white" />
                                </TouchableOpacity>
                            </SafeAreaView>
                        )}
                        FooterComponent={({ imageIndex }) => (
                            <View style={styles.footer}>
                                <ThemedText style={styles.footerText}>
                                    {imageIndex + 1} / {filteredPhotos.length}
                                </ThemedText>
                            </View>
                        )}
                    />
                </Modal>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileEmail: {
        fontSize: 16,
        color: 'gray',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        color: 'gray',
    },
    masonryContainer: {
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 2,rowGap:3,columnGap:3
    },
    imageWrapper: {
        flex: 1,
        margin: 2,
        borderRadius: 0,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        aspectRatio: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    floatingSearchContainer: {
        position: 'absolute',
        right: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
    floatingSearchGlass: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchFab: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedSearchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        width: '100%',
        height: '100%',
    },
    searchIconExpanded: {
        marginRight: 10,
    },
    searchInputExpanded: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    noResultsSubtext: {
        fontSize: 14,
        marginTop: 4,
        opacity: 0.6,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    footer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'white',
        fontSize: 16,
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#007BFF',
        fontSize: 16,
    },
});
