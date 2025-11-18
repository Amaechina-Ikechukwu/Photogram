📸 Photogram

Photogram is a modern image-sharing app built with Expo React Native and Firebase. Users can easily upload, view, and share photos in a clean, social-style feed. The app automatically strips EXIF data from uploaded images to protect user privacy.

✨ Features

📷 Image Uploads – Snap or choose images from your gallery and upload instantly.

🔒 Privacy First – EXIF metadata (location, camera details, etc.) is removed from all uploads.

� Google Authentication – Secure sign-in using Google OAuth for a seamless experience.

�🔥 Firebase Integration – Secure authentication, storage, and real-time database.

🌙 Dark & Light Mode – Seamless theme switching for user preference.

🚀 Cross-Platform – Runs on both iOS and Android with a single Expo codebase.

🛠️ Tech Stack

Frontend: Expo React Native

Backend & Storage: Firebase (Auth, Firestore, Storage, Cloud Functions)

Authentication: Google OAuth 2.0

Image Processing: Python Cloud Functions (Pillow) for EXIF data removal

📦 Installation & Setup

Clone the repo

git clone https://github.com/yourusername/photogram.git
cd photogram


Install dependencies

npm install
# or
yarn install


Configure Firebase & Google Auth

1. Add your Firebase project credentials in `.env` (copy from `.env.example`)
2. Set up Google OAuth credentials (see `GOOGLE_AUTH_SETUP.md` for detailed instructions)
3. Enable Google Authentication in Firebase Console
4. Enable Firestore and Storage in Firebase Console

Run locally

npx expo start


Deploy Cloud Function (Python)

Make sure you have the Firebase CLI installed.

Deploy the EXIF-stripping function:

firebase deploy --only functions


🔑 Authentication Setup

This app uses **Google Authentication only**. For detailed setup instructions, please refer to [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md).

Quick setup:
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Copy `.env.example` to `.env` and fill in your credentials
3. Enable Google sign-in in Firebase Console

🚧 Roadmap

✅ Basic image uploads

✅ EXIF stripping for privacy

✅ Google OAuth authentication

⏳ User profiles & followers

⏳ Like & comment system

⏳ Push notifications

📜 License

MIT License – feel free to use and modify for your own projects.