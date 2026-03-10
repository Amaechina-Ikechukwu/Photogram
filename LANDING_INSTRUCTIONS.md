# Photogram — AI Build Instructions
## Landing Page · Terms of Service · Privacy Policy

Use this document as the complete brief for building Photogram's public web presence.
All copy, imagery, colors, features, and legal context are defined below.

---

## 1. App Identity

| Field | Value |
|---|---|
| **App name** | Photogram |
| **Tagline** | *Capture. Share. Inspire.* |
| **Platform** | iOS & Android (React Native / Expo) |
| **Package ID** | `com.rm.photogram` |
| **Version** | 1.0.0 |
| **Auth provider** | Google Sign-In (Firebase) |
| **Backend** | REST API + Firebase Storage |

---

## 2. Brand Colors

| Token | Hex | Usage |
|---|---|---|
| Primary / Tint | `#0a7ea4` | Buttons, links, active states |
| Light background | `#ffffff` | Page background |
| Dark background | `#151718` | Dark-mode page background |
| Light text | `#11181C` | Body text (light mode) |
| Dark text | `#ECEDEE` | Body text (dark mode) |
| Icon / Muted | `#687076` | Secondary text, icons |

Use `#0a7ea4` as the dominant accent. Typography should feel clean and editorial — photography-centric aesthetic.

---

## 3. Splash / Hero Images

These are the exact production CDN URLs from Firebase Storage.
Use them **as-is** for hero sections, background collages, feature cards, and testimonial backdrops.

```
IMAGE_1 (portrait, natural light):
https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fy-s-zpWdIbZ_jwM-unsplash.jpg?alt=media&token=4bfbca20-0396-4679-bd3f-80ac37b0c98c

IMAGE_2 (landscape, warm tones):
https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Flaura-cleffmann-gRT7o73xua0-unsplash.jpg?alt=media&token=50dc5c32-5aea-4095-a2fe-576df22ff161

IMAGE_3 (urban / street):
https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fspenser-sembrat-s7W2PXuYGcc-unsplash.jpg?alt=media&token=6aaf498a-136a-47b8-b991-b1c0e4ed17c5

IMAGE_4 (soft / minimal):
https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fmadeline-liu-LgSZnc4T0_o-unsplash.jpg?alt=media&token=cd4c9e5a-8e4c-4c21-8a64-1b046c644700

IMAGE_5 (dark / moody):
https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fnik-Us-QFSJjkas-unsplash.jpg?alt=media&token=36abe97d-568d-4b73-9214-8c620cdc30a8

IMAGE_6 (vibrant / colorful):
https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Firyna-studenets-E6GngziykS0-unsplash.jpg?alt=media&token=ff76078e-a113-4232-b8f3-47780d6fa15c

IMAGE_7 (editorial / fashion):
https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fkellen-riggin-OVLu_Bp43wQ-unsplash.jpg?alt=media&token=97d98ae9-1681-49fa-aef4-575d6b3aa7c9
```

**Recommended layout usage:**
- **Hero**: Full-bleed collage grid or masonry with IMAGE_1, IMAGE_3, IMAGE_6 in front
- **Feature section backgrounds**: IMAGE_2 and IMAGE_4 (soft/minimal)
- **Dark-mode / mood section**: IMAGE_5 (dark/moody)
- **Footer accent**: IMAGE_7 (editorial)

---

## 4. Core App Features (for landing page copy)

### 4.1 Feed — Discover Photos
> Onboarding text: *"Explore stunning photography from around the world"*

- Browse a curated, paginated public feed of photos from all users
- Infinite scroll with 10 photos per page
- Like photos with a single tap
- Leave comments on any photo
- Works without an account — no sign-in required to browse

### 4.2 Collections
> Organized by category so you can find what inspires you

- Photos are grouped by category tags
- Browse collections by topic (nature, urban, portrait, etc.)
- Tap any photo to open full-screen detail view
- Swipe between photos within a collection

### 4.3 Upload
> Onboarding text: *"Share your life through beautiful photos"*

- Select one or multiple photos from your device gallery
- Pick from albums or scroll all photos
- Real-time upload progress indicator
- Tags are assigned for discoverability
- Upload requires sign-in (free, Google account)

### 4.4 Profile
> Your creative portfolio, always up to date

- Personal grid of all your uploaded photos
- Stats dashboard: total uploads, total views, total likes
- Search your own photos by tag
- Edit your display name
- Full-screen photo viewer with pinch-to-zoom

### 4.5 Authentication
- One-tap Google Sign-In — no password needed
- Public browsing (feed + collections) is available without an account
- Profile and upload features require a free Google account

### 4.6 Settings
- Logout
- (future: notification preferences, account deletion)

---

## 5. Landing Page — Build Specification

### 5.1 Page Structure

Build a single-page website with the following sections **in order**:

```
1. Navigation bar
2. Hero section
3. Features section  (3 feature cards)
4. App showcase / screenshots section
5. Photo gallery strip
6. Call-to-action section
7. Footer
```

---

### 5.2 Navigation Bar

- Logo: Text "Photogram" in bold, color `#0a7ea4`
- Links: Features · Privacy · Terms
- CTA button: "Download the App" → anchor to CTA section
- Sticky on scroll, subtle frosted-glass blur background (`backdrop-filter: blur`)
- Mobile: hamburger menu

---

### 5.3 Hero Section

**Heading:** `Capture Moments. Inspire the World.`
**Subheading:** `A beautiful photo community for photographers of every level. Browse stunning images, share your work, and connect with creatives worldwide.`

**Visuals:** Mosaic/masonry grid of the 7 splash images (use `object-fit: cover`).
Overlay a dark gradient from left (text side) to right (image side) on desktop.
On mobile, stack images below text.

**CTA Buttons:**
- Primary: "Get it on Google Play" (link placeholder `#`)
- Secondary: "Download on the App Store" (link placeholder `#`)

---

### 5.4 Features Section

Three cards in a 3-column grid (stack on mobile):

| # | Icon | Title | Body |
|---|---|---|---|
| 1 | Camera / Upload | **Share Your Photos** | Pick photos straight from your gallery and share them with a global community in seconds. Real-time upload progress keeps you in the loop. |
| 2 | Compass / Discover | **Discover & Explore** | Browse an endless feed of photography from around the world — no account needed. Like and comment to connect with the photographers you love. |
| 3 | Grid / Collection | **Curated Collections** | Photos organized by category so you can find exactly what inspires you. From urban landscapes to intimate portraits, every mood is covered. |

Cards: white background with subtle shadow, `#0a7ea4` icon color, 8px border-radius.

---

### 5.5 App Showcase Section

**Heading:** `Your creative portfolio, always with you.`
**Body:** `Your profile tracks every upload, view, and like. Search your photos by tag, view them full-screen, and manage your presence on the go.`

Visuals: Side-by-side phone mockup frames (use CSS device frames or SVG).
Left phone: feed/home screenshot placeholder.
Right phone: profile screenshot placeholder.
Background: Light gray `#f5f5f5` or the moody IMAGE_5 with opacity overlay.

---

### 5.6 Photo Gallery Strip

A horizontal auto-scrolling strip (CSS marquee / `animation: scroll`) using all 7 splash images.
Each image: 280px × 380px, `border-radius: 12px`, slight gap between items.
No pause on hover needed — purely decorative.

---

### 5.7 Call-to-Action Section

**Heading:** `Join the Community`
**Body:** `Free to download. No password required — just sign in with Google and start sharing.`

Buttons:
- "Get it on Google Play" (link placeholder `#`)
- "Download on the App Store" (link placeholder `#`)

Background: gradient from `#0a7ea4` to `#085f82` (slightly darker shade), white text.

---

### 5.8 Footer

Columns:
- **Photogram** — tagline "Capture. Share. Inspire."
- **Legal** — Privacy Policy · Terms of Service
- **Contact** — placeholder email `support@photogram.app`

Bottom line: `© 2026 Photogram. All rights reserved. Photos used under Unsplash license.`

---

### 5.9 Technical Requirements

- Pure HTML + CSS + minimal vanilla JS **or** Next.js static export — your choice
- Responsive: mobile-first, breakpoints at 768px and 1024px
- Images must use the exact CDN URLs from Section 3 above (no downloads)
- Add `loading="lazy"` to all images except above-the-fold hero
- Color scheme supports `prefers-color-scheme: dark` automatically
- Accessible: semantic HTML5, alt text on all images, focus-visible states

---

## 6. Terms of Service

**Effective date:** March 5, 2026
**App:** Photogram
**Contact:** support@photogram.app

---

### Terms of Service — Full Text

```
PHOTOGRAM TERMS OF SERVICE
Effective Date: March 5, 2026

1. Acceptance of Terms
By downloading, installing, or using the Photogram mobile application ("App"), you agree
to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
do not use the App.

2. Eligibility
You must be at least 13 years of age to use Photogram. By using the App you represent
and warrant that you meet this requirement. If you are under 18, you confirm that you
have obtained parental or guardian consent.

3. Account Registration
Photogram uses Google Sign-In for authentication. By signing in you agree to Google's
Terms of Service in addition to these Terms. You are responsible for all activity that
occurs under your account.

4. User Content
4.1. You retain ownership of any photos or content you upload ("User Content").
4.2. By uploading content, you grant Photogram a non-exclusive, royalty-free, worldwide
     licence to display, distribute, and promote your content within the App and on
     associated marketing materials (e.g., the landing page).
4.3. You represent and warrant that your User Content does not infringe any third-party
     rights and complies with all applicable laws.
4.4. You must not upload content that is illegal, harmful, hateful, obscene, or that
     infringes the intellectual property rights of others.

5. Prohibited Conduct
You agree not to:
- Use the App for any unlawful purpose.
- Upload malware, viruses, or any harmful code.
- Attempt to gain unauthorized access to any part of the App or its servers.
- Scrape, harvest, or collect other users' data without consent.
- Impersonate any person or entity.
- Harass, threaten, or abuse other users.

6. Intellectual Property
All design, code, trademarks, and non-user content in the App are owned by or licensed
to Photogram. You may not reproduce or distribute any part of the App without prior
written permission.

7. Termination
We reserve the right to suspend or terminate your access to the App at any time, with or
without cause, and with or without notice. Upon termination, your right to use the App
ceases immediately.

8. Disclaimer of Warranties
THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.

9. Limitation of Liability
TO THE FULLEST EXTENT PERMITTED BY LAW, PHOTOGRAM SHALL NOT BE LIABLE FOR ANY INDIRECT,
INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP.

10. Changes to Terms
We may update these Terms at any time. Continued use of the App after changes constitutes
acceptance of the revised Terms. We will notify users of material changes via the App.

11. Governing Law
These Terms are governed by the laws of the jurisdiction in which Photogram operates,
without regard to conflict of law principles.

12. Contact
For questions about these Terms, contact us at: support@photogram.app
```

---

## 7. Privacy Policy

**Effective date:** March 5, 2026
**App:** Photogram
**Contact:** support@photogram.app

---

### Privacy Policy — Full Text

```
PHOTOGRAM PRIVACY POLICY
Effective Date: March 5, 2026

1. Introduction
Photogram ("we", "us", or "our") respects your privacy. This Privacy Policy explains
what information we collect, how we use it, and your rights regarding that information
when you use our mobile application ("App").

2. Information We Collect

2.1 Information you provide directly
- Display name and email address (obtained via Google Sign-In)
- Photos and images you choose to upload

2.2 Information collected automatically
- Device type and operating system
- App usage data (screens viewed, features used)
- Crash reports and performance data

2.3 Information from third parties
- Google account profile data (name, email, profile picture) when you sign in with Google

3. How We Use Your Information
We use your information to:
- Create and manage your account
- Display your photos in the public feed and your personal profile
- Calculate and display engagement statistics (views, likes per photo)
- Improve the App's performance and fix bugs
- Respond to your support requests
- Comply with our legal obligations

4. Photos and User Content
Photos you upload are stored on Firebase Storage (Google Cloud) and are publicly
accessible within the App to all users, including visitors who are not signed in.
Do not upload photos you do not wish to share publicly.

5. Device Permissions
The App may request the following device permissions:
- READ_MEDIA_IMAGES / READ_EXTERNAL_STORAGE — to access photos from your device gallery
- ACCESS_MEDIA_LOCATION — to read GPS metadata embedded in photos (EXIF data)
  NOTE: We do not currently use or store location metadata. This permission is used
  only for media access on Android.
- WRITE_EXTERNAL_STORAGE — required on older Android versions for media access

You can revoke these permissions at any time in your device Settings.

6. Data Sharing
We do not sell your personal information.
We share data only in the following limited circumstances:
- **Firebase / Google Cloud** — for authentication, database, and file storage services
- **Legal obligations** — if required by law, court order, or governmental authority
- **Business transfer** — in connection with a merger, acquisition, or sale of assets

7. Data Retention
- Your account data is retained as long as your account is active.
- Uploaded photos remain in storage until you delete them or your account is deleted.
- You may request deletion of your data at any time by contacting support@photogram.app.

8. Children's Privacy
Photogram is not directed to children under 13. We do not knowingly collect personal
information from children under 13. If we learn that we have collected such information,
we will delete it promptly.

9. Security
We implement industry-standard security measures including encrypted data transmission
(HTTPS/TLS) and secure Firebase authentication tokens. However, no system is completely
secure, and we cannot guarantee absolute security.

10. Your Rights
Depending on your location, you may have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your data
- Withdraw consent where processing is based on consent

To exercise any of these rights, contact us at support@photogram.app.

11. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of significant
changes by posting a notice in the App. Continued use of the App after changes indicates
your acceptance of the updated policy.

12. Contact Us
If you have any questions or concerns about this Privacy Policy, please contact us at:
Email: support@photogram.app
App: Photogram (com.ikaychina.photogram)
```

---

## 8. Quick Reference — All Image URLs

| Key | URL |
|---|---|
| IMAGE_1 (Y_S) | `https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fy-s-zpWdIbZ_jwM-unsplash.jpg?alt=media&token=4bfbca20-0396-4679-bd3f-80ac37b0c98c` |
| IMAGE_2 (Laura Cleffmann) | `https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Flaura-cleffmann-gRT7o73xua0-unsplash.jpg?alt=media&token=50dc5c32-5aea-4095-a2fe-576df22ff161` |
| IMAGE_3 (Spenser Sembrat) | `https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fspenser-sembrat-s7W2PXuYGcc-unsplash.jpg?alt=media&token=6aaf498a-136a-47b8-b991-b1c0e4ed17c5` |
| IMAGE_4 (Madeline Liu) | `https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fmadeline-liu-LgSZnc4T0_o-unsplash.jpg?alt=media&token=cd4c9e5a-8e4c-4c21-8a64-1b046c644700` |
| IMAGE_5 (Nik Us) | `https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fnik-Us-QFSJjkas-unsplash.jpg?alt=media&token=36abe97d-568d-4b73-9214-8c620cdc30a8` |
| IMAGE_6 (Iryna Studenets) | `https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Firyna-studenets-E6GngziykS0-unsplash.jpg?alt=media&token=ff76078e-a113-4232-b8f3-47780d6fa15c` |
| IMAGE_7 (Kellen Riggin) | `https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fkellen-riggin-OVLu_Bp43wQ-unsplash.jpg?alt=media&token=97d98ae9-1681-49fa-aef4-575d6b3aa7c9` |
