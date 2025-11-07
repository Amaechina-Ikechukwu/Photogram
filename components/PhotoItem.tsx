import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import GlassBackground from './ui/GlassBackground';
import { ThemedText } from './ThemedText';

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

interface PhotoItemProps {
  item: PublicPhoto;
  index: number;
  onPress: (item: PublicPhoto, index: number) => void;
  // onLike will be called with the item and the new liked state (true = liked)
  onLike?: (item: PublicPhoto, newLiked: boolean) => void;
}

export default function PhotoItem({ item, index, onPress, onLike }: PhotoItemProps) {
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(item.hasLiked);

  // Keep local liked state in sync if parent updates item.hasLiked
  React.useEffect(() => {
    setLiked(item.hasLiked);
  }, [item.hasLiked]);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    if (onLike) {
      onLike(item, newLiked);
    }
  };

  return (
    <Pressable onPress={() => onPress(item, index)} style={styles.photoWrapper}>
      <Image
        source={{ uri: item.photo.imageUrl }}
        style={styles.photo}
        contentFit="cover"
        placeholder={{ blurhash: 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH' }}
        onLoad={() => {
        
        }}
        onError={(error) => {
          console.error('Image load error:', error, item.photo.imageUrl);
          setImageError(true);
        }}
        transition={300}
        cachePolicy="memory-disk"
      />
      
      {/* Author name with glass background */}
      <View style={styles.authorContainer}>
        <GlassBackground style={styles.authorGlass}>
          <View style={styles.authorContent}>
            <Ionicons name="person-circle-outline" size={20} color="#fff" />
            <ThemedText style={styles.authorName}>
              {item.user.name || item.user.email.split('@')[0]}
            </ThemedText>
          </View>
        </GlassBackground>
      </View>

      {/* Floating heart button with glass background */}
      <View style={styles.heartContainer}>
        <GlassBackground style={styles.heartGlass}>
          <TouchableOpacity onPress={handleLike} style={styles.heartButton}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#ff4444" : "#fff"}
            />
          </TouchableOpacity>
        </GlassBackground>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photoWrapper: {
    marginBottom: 10,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 500,
    borderRadius: 12,
  },
  authorContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
   
    zIndex: 1,
  },
  authorGlass: {
    borderRadius: 20,
  },
  authorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  authorName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heartContainer: {
    position: 'absolute',
     bottom: 10,
    left: 10,
    zIndex: 1,
  },
  heartGlass: {
    borderRadius: 25,
  },
  heartButton: {
    padding: 10,
  },
});
