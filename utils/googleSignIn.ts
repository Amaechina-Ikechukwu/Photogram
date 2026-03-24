import appConfig from '@/app.json';
import googleServices from '@/google-services.json';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

type GoogleServicesOAuthClient = {
  client_id?: string;
  client_type?: number;
  android_info?: {
    certificate_hash?: string;
    package_name?: string;
  };
};

type GoogleServicesClient = {
  client_info?: {
    android_client_info?: {
      package_name?: string;
    };
  };
  oauth_client?: GoogleServicesOAuthClient[];
};

type GoogleServicesConfig = {
  client?: GoogleServicesClient[];
};

let configured = false;

const androidPackageName = appConfig.expo.android?.package;
const googleServicesConfig = googleServices as GoogleServicesConfig;
const envWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

function getAndroidGoogleClient() {
  if (!androidPackageName) {
    return undefined;
  }

  return googleServicesConfig.client?.find(
    (client) =>
      client.client_info?.android_client_info?.package_name === androidPackageName
  );
}

function getRegisteredWebClientId() {
  return getAndroidGoogleClient()
    ?.oauth_client?.find((client) => client.client_type === 3)
    ?.client_id?.trim();
}

function getRegisteredAndroidCertHash() {
  return getAndroidGoogleClient()
    ?.oauth_client?.find(
      (client) =>
        client.client_type === 1 &&
        client.android_info?.package_name === androidPackageName
    )
    ?.android_info?.certificate_hash?.toUpperCase();
}

const registeredWebClientId = getRegisteredWebClientId();
const resolvedWebClientId = registeredWebClientId ?? envWebClientId;

export function configureGoogleSignIn() {
  if (configured) {
    return;
  }

  if (
    envWebClientId &&
    registeredWebClientId &&
    envWebClientId !== registeredWebClientId
  ) {
    console.warn(
      'Google Sign-In env web client ID does not match google-services.json for the current Android package. Using google-services.json instead.'
    );
  }

  if (!resolvedWebClientId) {
    console.warn(
      'Google Sign-In has no resolved web client ID. ID tokens will not be requested.'
    );
  }

  GoogleSignin.configure({
    ...(resolvedWebClientId
      ? { webClientId: resolvedWebClientId, offlineAccess: true }
      : {}),
    scopes: ['profile', 'email'],
  });

  configured = true;
}

export function getGoogleSignInDebugInfo() {
  return {
    androidPackageName: androidPackageName ?? null,
    hasEnvWebClientId: Boolean(envWebClientId),
    hasResolvedWebClientId: Boolean(resolvedWebClientId),
    registeredAndroidCertHash: getRegisteredAndroidCertHash() ?? null,
    resolvedWebClientIdSource: registeredWebClientId
      ? 'google-services.json'
      : envWebClientId
        ? 'env'
        : 'missing',
  };
}

export function getGoogleSignInErrorMessage(error: unknown) {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return 'Google Sign-In was cancelled.';
      case statusCodes.IN_PROGRESS:
        return 'Google Sign-In is already in progress.';
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Google Play Services is unavailable or needs an update.';
      default:
        break;
    }
  }

  const message =
    error instanceof Error ? error.message : 'Google Sign-In failed.';

  if (message.includes('DEVELOPER_ERROR')) {
    const appId = androidPackageName ?? 'this app';
    return `Google Sign-In is not configured for this build. Verify the Firebase app for ${appId}, add this build's SHA-1/SHA-256 fingerprints, and refresh the Google service files.`;
  }

  return message;
}
