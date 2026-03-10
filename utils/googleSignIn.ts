import { GoogleSignin } from '@react-native-google-signin/google-signin';

let configured = false;

export function configureGoogleSignIn() {
  if (configured) {
    return;
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  GoogleSignin.configure({
    ...(webClientId ? { webClientId } : {}),
    ...(iosClientId ? { iosClientId } : {}),
    ...(androidClientId ? { androidClientId } : {}),
    offlineAccess: true,
    scopes: ['profile', 'email'],
  });

  configured = true;
}