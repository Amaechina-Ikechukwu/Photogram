import React, { useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

type CommentInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export default function CommentInput({ value, onChangeText, onSubmit, isSubmitting }: CommentInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputRef = useRef<TextInput>(null);

  return (
    <View 
      style={[
        styles.container, 
        { 
          borderTopColor: isDark ? '#333' : '#f0f0f0',
          backgroundColor: isDark ? '#000' : '#fff',
        }
      ]}
    >
      <View style={[
        styles.inputWrapper,
        { backgroundColor: isDark ? '#1a1a1a' : '#f8f8f8' }
      ]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: isDark ? '#fff' : '#000' }
          ]}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
        />
        {value.trim().length > 0 && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.postText}>Post</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  postText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
