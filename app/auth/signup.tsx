import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { auth } from "@/firebaseConfig";
import { router } from "expo-router";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useState, useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

WebBrowser.maybeCompleteAuthSession();

// Import splash images
const splashImages = [
  require('../../assets/splash-images/madeline-liu-LgSZnc4T0_o-unsplash.jpg'),
  require('../../assets/splash-images/nik-Us-QFSJjkas-unsplash.jpg'),
  require('../../assets/splash-images/iryna-studenets-E6GngziykS0-unsplash.jpg'),
];

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const authContext = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignUp(id_token);
    }
  }, [response]);

  const handleGoogleSignUp = async (idToken: string) => {
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      authContext?.setUser(result.user);
      toast.show("Account created successfully!", { type: "success" });
      router.replace("/");
    } catch (err: any) {
      const msg = err?.message ?? "Google Sign-Up failed";
      toast.show(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Images */}
      <View style={styles.imageGrid}>
        {splashImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image 
              source={image} 
              style={styles.image} 
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`signup-bg-${index}`}
              allowDownscaling={true}
              priority="normal"
            />
          </View>
        ))}
      </View>

      {/* Gradient Overlay */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']
            : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.95)']
        }
        style={styles.overlay}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* App Icon */}
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
          Join Photogram
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Create an account with your Google account
        </ThemedText>

        {/* Google Sign-Up Button */}
        <Pressable 
          style={styles.googleButton} 
          onPress={() => promptAsync()}
          disabled={!request || loading}
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
              <ThemedText style={styles.googleButtonText}>Sign Up with Google</ThemedText>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => router.push("/auth/login")}>
          <ThemedText style={styles.linkText}>
            Already have an account? Sign In
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.infoText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
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
  linkText: {
    textAlign: "center",
    color: "#007AFF",
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    paddingHorizontal: 20,
  },
});
