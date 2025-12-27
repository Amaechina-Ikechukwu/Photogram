/**
 * Photogram Splash Screen Images
 * 
 * Using remote URLs instead of local assets to improve app performance
 * and reduce bundle size.
 */

export const SPLASH_IMAGE_URLS = {
  IRYNA_STUDENETS: 'https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Firyna-studenets-E6GngziykS0-unsplash.jpg?alt=media&token=ff76078e-a113-4232-b8f3-47780d6fa15c',
  KELLEN_RIGGIN: 'https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fkellen-riggin-OVLu_Bp43wQ-unsplash.jpg?alt=media&token=97d98ae9-1681-49fa-aef4-575d6b3aa7c9',
  LAURA_CLEFFMANN: 'https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Flaura-cleffmann-gRT7o73xua0-unsplash.jpg?alt=media&token=50dc5c32-5aea-4095-a2fe-576df22ff161',
  MADELINE_LIU: 'https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fmadeline-liu-LgSZnc4T0_o-unsplash.jpg?alt=media&token=cd4c9e5a-8e4c-4c21-8a64-1b046c644700',
  NIK_US: 'https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fnik-Us-QFSJjkas-unsplash.jpg?alt=media&token=36abe97d-568d-4b73-9214-8c620cdc30a8',
  SPENSER_SEMBRAT: 'https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fspenser-sembrat-s7W2PXuYGcc-unsplash.jpg?alt=media&token=6aaf498a-136a-47b8-b991-b1c0e4ed17c5',
  Y_S: 'https://firebasestorage.googleapis.com/v0/b/musterus-api.appspot.com/o/photogram%20splashscreen%2Fy-s-zpWdIbZ_jwM-unsplash.jpg?alt=media&token=4bfbca20-0396-4679-bd3f-80ac37b0c98c',
} as const;

// Array format for easy iteration
export const SPLASH_IMAGES_ARRAY = [
  SPLASH_IMAGE_URLS.Y_S,
  SPLASH_IMAGE_URLS.LAURA_CLEFFMANN,
  SPLASH_IMAGE_URLS.SPENSER_SEMBRAT,
  SPLASH_IMAGE_URLS.MADELINE_LIU,
  SPLASH_IMAGE_URLS.NIK_US,
  SPLASH_IMAGE_URLS.IRYNA_STUDENETS,
  SPLASH_IMAGE_URLS.KELLEN_RIGGIN,
];
