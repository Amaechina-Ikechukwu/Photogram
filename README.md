📸 Photogram

Photogram is a modern image-sharing app built with Expo React Native and Firebase. Users can easily upload, view, and share photos in a clean, social-style feed. The app automatically strips EXIF data from uploaded images to protect user privacy.

✨ Features

📷 Image Uploads – Snap or choose images from your gallery and upload instantly.

🔒 Privacy First – EXIF metadata (location, camera details, etc.) is removed from all uploads.

🔥 Firebase Integration – Secure authentication, storage, and real-time database.

🌙 Dark & Light Mode – Seamless theme switching for user preference.

🚀 Cross-Platform – Runs on both iOS and Android with a single Expo codebase.

🛠️ Tech Stack

Frontend: Expo React Native

Backend & Storage: Firebase (Auth, Firestore, Storage, Cloud Functions)

Image Processing: Python Cloud Functions (Pillow) for EXIF data removal

📦 Installation & Setup

Clone the repo

git clone https://github.com/yourusername/photogram.git
cd photogram


Install dependencies

npm install
# or
yarn install


Configure Firebase

Add your Firebase project credentials in firebaseConfig.js (or .env).

Enable Authentication, Firestore, and Storage in Firebase Console.

Run locally

npx expo start


Deploy Cloud Function (Python)

Make sure you have the Firebase CLI installed.

Deploy the EXIF-stripping function:

firebase deploy --only functions


🚧 Roadmap

✅ Basic image uploads

✅ EXIF stripping for privacy

⏳ User profiles & followers

⏳ Like & comment system

⏳ Push notifications

📜 License

MIT License – feel free to use and modify for your own projects.