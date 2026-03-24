import { ThemedText } from "@/components/ThemedText";
import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { SPLASH_IMAGE_URLS } from '@/constants/ImageUrls';
import {
  configureGoogleSignIn,
  getGoogleSignInDebugInfo,
  getGoogleSignInErrorMessage,
} from '@/utils/googleSignIn';

configureGoogleSignIn();

const splashImages = [
  SPLASH_IMAGE_URLS.Y_S,
  SPLASH_IMAGE_URLS.LAURA_CLEFFMANN,
  SPLASH_IMAGE_URLS.SPENSER_SEMBRAT,
];

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const authContext = useAuth();
  const toast = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }
      
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      authContext?.setUser(result.user);
      toast.show("Logged in successfully with Google!", { type: "success" });
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = getGoogleSignInErrorMessage(err);
      toast.show(msg, { type: "error" });
      console.error('Google Sign-In Error:', err, getGoogleSignInDebugInfo());
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageGrid}>
        {splashImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image 
              source={{ uri: image }}
              style={styles.image} 
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`login-bg-${index}`}
              allowDownscaling={true}
              priority="normal"
            />
          </View>
        ))}
      </View>

      <LinearGradient
        colors={
          isDark
            ? ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']
            : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.95)']
        }
        style={styles.overlay}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={styles.iconBlur}>
            <Image
              source={require('../../assets/images/adaptive-icon.png')}
              style={styles.appIcon}
              contentFit="contain"
            />
          </BlurView>
        </View>

        <ThemedText type="title" style={styles.title}>
          Welcome to Photogram
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Sign in with your Google account to continue
        </ThemedText>

        <Pressable 
          style={styles.googleButton} 
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <LinearGradient
            colors={['#4285F4', '#34A853', '#FBBC05', '#EA4335']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.googleGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
            )}
          </LinearGradient>
        </Pressable>

        <ThemedText style={styles.infoText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBlur: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appIcon: {
    width: 80,
    height: 80,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 40,
    fontSize: 16,
    opacity: 0.8,
  },
  googleButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  googleGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    paddingHorizontal: 20,
  },
});
