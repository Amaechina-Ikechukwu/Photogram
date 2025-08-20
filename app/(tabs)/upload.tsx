// app/upload.tsx
import React, { useState } from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/firebaseConfig"; // your config file
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from 'expo-router';

export default function UploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

  setUploading(true);
  const filename = `photos/${auth?.currentUser?.uid}/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);

    // Fetch image as blob
    const response = await fetch(image);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        // Clear local UI state
        
        setImage(null);
        setProgress(0);
        setUploading(false);

        // Navigate to the Photos tab and include a refresh query param so the
        // Photos screen can re-fetch its data.
        setTimeout(() => {
           router.push(`/(tabs)?refresh=${Date.now()}`);
        }, 500);
       
      }
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Upload an Image</ThemedText>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      <TouchableOpacity
        style={[styles.button, uploading ? styles.buttonDisabled : null]}
        onPress={pickImage}
        disabled={uploading}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      {image && (
        <TouchableOpacity
          style={[styles.button, styles.uploadButton, uploading ? styles.buttonDisabled : null]}
          onPress={uploadImage}
          disabled={uploading}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload'}</Text>
        </TouchableOpacity>
      )}

      {uploading && <ThemedText>Uploading... {progress.toFixed(0)}%</ThemedText>}

      {downloadURL && (
        <>
         
          <ThemedText selectable>{downloadURL}</ThemedText>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#10B981', // green (distinct from Pick Image button)
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
