
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/firebaseConfig';
import { router } from 'expo-router';

interface Upload {
  id: string;
  progress: number;
  totalFiles: number;
  completedFiles: number;
}

interface UploadContextType {
  uploads: Upload[];
  startUpload: (isPublic: boolean) => void;
  uploading: boolean;
  imagesToUpload: MediaLibrary.Asset[];
  setImagesToUpload: (files: MediaLibrary.Asset[]) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

interface UploadProviderProps {
  children: ReactNode;
}

export const UploadProvider = ({ children }: UploadProviderProps) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imagesToUpload, setImagesToUploadState] = useState<MediaLibrary.Asset[]>([]);

  const setImagesToUpload = (files: MediaLibrary.Asset[]) => {
    setImagesToUploadState(files);
  };

  const startUpload = async (isPublic: boolean) => {
    if (imagesToUpload.length === 0) return;

    if (!auth?.currentUser?.uid) {
      Alert.alert('Error', 'You must be logged in to upload photos');
      return;
    }

    setUploading(true);
    const newUpload: Upload = {
      id: Date.now().toString(),
      progress: 0,
      totalFiles: imagesToUpload.length,
      completedFiles: 0,
    };
    setUploads(prev => [...prev, newUpload]);

    // Navigate immediately to allow background upload
    router.replace(`/(tabs)?refresh=true`);

    // Continue upload in background
    (async () => {
      try {
        const uploadPromises = imagesToUpload.map(async (asset, index) => {
          const filename = `photos/${auth.currentUser!.uid}/${Date.now()}-${index}.jpg`;
          const storageRef = ref(storage, filename);

          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
          if (!assetInfo.localUri && !assetInfo.uri) {
            throw new Error('Could not access asset URI');
          }

          const uri = assetInfo.localUri || assetInfo.uri;
          const response = await fetch(uri);
          const blob = await response.blob();

          const uploadMeta = { customMetadata: { uid: auth.currentUser!.uid, public: String(isPublic) } };
          const uploadTask = uploadBytesResumable(storageRef, blob, uploadMeta);

          return new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              snapshot => {
                const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploads(prev =>
                  prev.map(up => {
                    if (up.id === newUpload.id) {
                      const totalProgress = (up.completedFiles * 100 + prog) / up.totalFiles;
                      return { ...up, progress: totalProgress };
                    }
                    return up;
                  })
                );
              },
              error => {
                console.error('Upload failed:', error);
                reject(error);
              },
              async () => {
                try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  setUploads(prev =>
                    prev.map(up => {
                      if (up.id === newUpload.id) {
                        const completedFiles = up.completedFiles + 1;
                        const totalProgress = (completedFiles * 100) / up.totalFiles;
                        return { ...up, completedFiles, progress: totalProgress };
                      }
                      return up;
                    })
                  );
                  resolve(downloadURL);
                } catch (error) {
                  console.error('Error getting download URL:', error);
                  reject(error);
                }
              }
            );
          });
        });

        await Promise.all(uploadPromises);
        
        Alert.alert(
          'Success!', 
          `Successfully uploaded ${imagesToUpload.length} image(s)`
        );
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert(
          'Upload Failed', 
          'There was an error uploading your photos. Please check your connection and try again.'
        );
      } finally {
        setUploading(false);
        setUploads(prev => prev.filter(up => up.id !== newUpload.id));
      }
    })();
  };

  return (
    <UploadContext.Provider value={{ uploads, startUpload, uploading, imagesToUpload, setImagesToUpload }}>
      {children}
    </UploadContext.Provider>
  );
};
