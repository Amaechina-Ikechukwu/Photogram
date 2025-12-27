import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPLASH_IMAGES_ARRAY } from '@/constants/ImageUrls';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Use remote image URLs for better performance
const splashImages = SPLASH_IMAGES_ARRAY;

const onboardingData = [
  {
    title: 'Capture Moments',
    subtitle: 'Share your life through beautiful photos',
    images: [splashImages[0], splashImages[1], splashImages[2]],
  },
  {
    title: 'Discover & Inspire',
    subtitle: 'Explore stunning photography from around the world',
    images: [splashImages[3], splashImages[4], splashImages[5], splashImages[6]],
  },
  {
    title: 'Join the Community',
    subtitle: 'Connect with photographers and share your passion',
    images: splashImages,
  },
];

export default function WelcomeScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < onboardingData.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * (currentPage + 1),
        animated: true,
      });
    } else {
      // Mark welcome as seen
      AsyncStorage.setItem('hasSeenWelcome', 'true');
      router.push('/auth/login');
    }
  };

  const skipToLogin = () => {
    // Mark welcome as seen
    AsyncStorage.setItem('hasSeenWelcome', 'true');
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((page, index) => (
          <OnboardingPage
            key={index}
            {...page}
            isActive={currentPage === index}
            isDark={isDark}
            pageIndex={index}
          />
        ))}
      </ScrollView>

      {/* Skip Button */}
      <Pressable style={styles.skipButton} onPress={skipToLogin}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.skipBlur}>
            <Text style={[styles.skipText, { color: isDark ? '#fff' : '#000' }]}>
              Skip
            </Text>
          </BlurView>
        ) : (
          <View style={[styles.skipBlur, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }]}>
            <Text style={[styles.skipText, { color: isDark ? '#fff' : '#000' }]}>
              Skip
            </Text>
          </View>
        )}
      </Pressable>

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.bottomBlur}>
            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {onboardingData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentPage === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Continue Button */}
            <Pressable
              style={[
                styles.continueButton,
                currentPage === onboardingData.length - 1 && styles.finalButton,
              ]}
              onPress={goToNextPage}
            >
              <LinearGradient
                colors={
                  currentPage === onboardingData.length - 1
                    ? ['#FFD700', '#FFA500']
                    : ['#667eea', '#764ba2']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>
                  {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
                </Text>
              </LinearGradient>
            </Pressable>
          </BlurView>
        ) : (
          <View style={[styles.bottomBlur, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)' }]}>
            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {onboardingData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentPage === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Continue Button */}
            <Pressable
              style={[
                styles.continueButton,
                currentPage === onboardingData.length - 1 && styles.finalButton,
              ]}
              onPress={goToNextPage}
            >
              <LinearGradient
                colors={
                  currentPage === onboardingData.length - 1
                    ? ['#FFD700', '#FFA500']
                    : ['#667eea', '#764ba2']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>
                  {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

interface OnboardingPageProps {
  title: string;
  subtitle: string;
  images: any[];
  isActive: boolean;
  isDark: boolean;
  pageIndex: number;
}

function OnboardingPage({ title, subtitle, images, isActive, isDark, pageIndex }: OnboardingPageProps) {
  // Only render images for the active page to reduce memory usage
  if (!isActive) {
    return (
      <View style={styles.page}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']
              : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']
          }
          style={[styles.overlay, { height: SCREEN_HEIGHT }]}
        />
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>{subtitle}</Text>
        </View>
      </View>
    );
  }

  // Create a masonry-like layout with the images
  const renderMasonryLayout = () => {
    if (images.length === 3) {
      // Layout 1: Three images - tall left, two stacked right
      return (
        <>
          <View style={[styles.imageContainer, styles.tallLeft]}>
            <Image 
              source={{ uri: images[0] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img0`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.topRight]}>
            <Image 
              source={{ uri: images[1] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img1`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.bottomRight]}>
            <Image 
              source={{ uri: images[2] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img2`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
        </>
      );
    } else if (images.length === 4) {
      // Layout 2: Four images - two stacked left, two stacked right
      return (
        <>
          <View style={[styles.imageContainer, styles.topLeft]}>
            <Image 
              source={{ uri: images[0] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img0`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.middleLeft]}>
            <Image 
              source={{ uri: images[1] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img1`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.topRight]}>
            <Image 
              source={{ uri: images[2] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img2`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.bottomRight]}>
            <Image 
              source={{ uri: images[3] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img3`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
        </>
      );
    } else {
      // Layout 3: Full masonry with all images
      return (
        <>
          <View style={[styles.imageContainer, styles.tallLeft]}>
            <Image 
              source={{ uri: images[0] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img0`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.topRight]}>
            <Image 
              source={{ uri: images[1] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img1`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.bottomRight]}>
            <Image 
              source={{ uri: images[2] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img2`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.centerRight]}>
            <Image 
              source={{ uri: images[3] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img3`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
          <View style={[styles.imageContainer, styles.bottomLeft]}>
            <Image 
              source={{ uri: images[4] }}
              style={styles.image} 
              contentFit="cover" 
              transition={300}
              cachePolicy="memory"
              recyclingKey={`page${pageIndex}-img4`}
              allowDownscaling={true}
              priority="high"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              responsivePolicy="live"
            />
          </View>
        </>
      );
    }
  };

  return (
    <View style={styles.page}>
      {/* Background Images Grid */}
      <View style={styles.imageGrid}>
        {renderMasonryLayout()}
      </View>

      {/* Dark Overlay Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']
            : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']
        }
        style={styles.overlay}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageGrid: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Masonry layout positions
  tallLeft: {
    left: '5%',
    top: '5%',
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.55,
  },
  topLeft: {
    left: '5%',
    top: '5%',
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.26,
  },
  middleLeft: {
    left: '5%',
    top: '33%',
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.26,
  },
  bottomLeft: {
    left: '5%',
    top: '62%',
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.26,
  },
  topRight: {
    right: '5%',
    top: '5%',
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.35,
  },
  centerRight: {
    right: '5%',
    top: '42%',
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.26,
  },
  bottomRight: {
    right: '5%',
    top: '42%',
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.35,
  },
  largeImage: {
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.55,
  },
  smallImage: {
    width: SCREEN_WIDTH * 0.43,
    height: SCREEN_HEIGHT * 0.26,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
  },
  content: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  skipBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  bottomBlur: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#667eea',
  },
  continueButton: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  finalButton: {
    // Additional styles for final button if needed
  },
  continueGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
