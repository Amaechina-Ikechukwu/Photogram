import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

type CommentItemProps = {
  item: {
    id: string;
    text: string;
    userId: string;
    userName: string;
    createdAt: string;
    hasLiked?: boolean;
    likesCount?: number;
  };
  index: number;
  currentUserId?: string;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
};

// Fashionable muted palette
const avatarColors = [
  '#A8E6CF', // Mint
  '#DCEDC1', // Tea Green
  '#FFD3B6', // Apricot
  '#FFAAA5', // Salmon
  '#FF8B94', // Pastel Red
  '#957DAD', // Muted Purple
  '#D291BC', // Orchid
  '#FEC8D8', // Pale Pink
];

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

export default function CommentItem({ item, index, currentUserId, onLike, onDelete }: CommentItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isOwnComment = currentUserId === item.userId;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const animatedStyle = {
    opacity: scaleAnim,
    transform: [
      {
        translateY: scaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const avatarColor = avatarColors[(item.userId?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarInitials}>
          {item.userName ? item.userName.substring(0, 1).toUpperCase() : 'A'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.username, { color: isDark ? '#fff' : '#000' }]}>
            {item.userName || 'Anonymous'}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
        
        <Text style={[styles.text, { color: isDark ? '#ccc' : '#333' }]}>
          {item.text}
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => onLike(item.id)}
            style={styles.actionButton}
          >
            <Text style={[
              styles.actionText, 
              { color: item.hasLiked ? '#FF4B4B' : '#888' }
            ]}>
              {item.hasLiked ? 'Liked' : 'Like'}
            </Text>
            {(item.likesCount ?? 0) > 0 && (
              <Text style={styles.likesCount}>
                {item.likesCount}
              </Text>
            )}
          </TouchableOpacity>

          {isOwnComment && (
            <TouchableOpacity 
              onPress={() => onDelete(item.id)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => onLike(item.id)}
        style={styles.heartButton}
      >
        <Ionicons
          name={item.hasLiked ? 'heart' : 'heart-outline'}
          size={14}
          color={item.hasLiked ? '#FF4B4B' : '#888'}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  username: {
    fontSize: 13,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  likesCount: {
    fontSize: 12,
    color: '#888',
  },
  heartButton: {
    paddingTop: 2,
  },
});
