import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiDelete } from '@/utils/api';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import CommentsHeader from './comments/CommentsHeader';
import CommentItem from './comments/CommentItem';
import EmptyComments from './comments/EmptyComments';
import CommentInput from './comments/CommentInput';


type Comment = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  hasLiked?: boolean;
  likesCount?: number;
};

type CommentsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  photoId: string;
};

export default function CommentsBottomSheet({
  visible,
  onClose,
  photoId,
}: CommentsBottomSheetProps) {
  const { user } = useAuth() || {};
  const colorScheme = useColorScheme();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (visible && photoId) {
      fetchComments();
    }
  }, [visible, photoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      const response = await apiGet(`/comments/${photoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const mappedComments = (responseData.data || []).map((item: any) => ({
          id: item.comment.id,
          text: item.comment.text,
          userId: item.comment.userId,
          userName: item.user?.name || 'Anonymous',
          createdAt: new Date(item.comment.createdAt).toISOString(),
          hasLiked: item.hasLiked,
          likesCount: item.comment.likesCount,
        }));
        setComments(mappedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;

    try {
      setSubmitting(true);
      const token = await user.getIdToken();
      const response = await apiPost(`/comments/${photoId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText.trim() }),
      });

      if (response.ok) {
        setCommentText('');
        await fetchComments();
      } else {
        Alert.alert('Error', 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await apiPost(`/like/comment/toggle/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  hasLiked: data.data.hasLiked,
                  likesCount: (comment.likesCount || 0) + (data.data.hasLiked ? 1 : -1),
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await user.getIdToken();
              const response = await apiDelete(`/comments/${commentId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
              } else {
                Alert.alert('Error', 'Failed to delete comment');
              }
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height="70%">
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <CommentsHeader commentsCount={comments.length} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={({ item, index }) => (
              <CommentItem 
                item={item} 
                index={index} 
                currentUserId={user?.uid}
                onLike={handleLikeComment}
                onDelete={handleDeleteComment}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyComments />}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />
        )}

        {user && (
          <CommentInput 
            value={commentText}
            onChangeText={setCommentText}
            onSubmit={handleAddComment}
            isSubmitting={submitting}
          />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
