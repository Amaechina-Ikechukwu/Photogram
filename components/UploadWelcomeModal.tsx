import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface UploadWelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function UploadWelcomeModal({ 
  visible, 
  onClose, 
  onContinue 
}: UploadWelcomeModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={colorScheme ?? 'light'}
        style={styles.blurContainer}
      >
        <Pressable style={styles.overlay} onPress={onClose} />
        
        <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Pressable 
            style={styles.closeButton} 
            onPress={onClose}
            hitSlop={8}
          >
            <MaterialIcons 
              name="close" 
              size={28} 
              color={colors.text} 
            />
          </Pressable>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Image */}
            <View style={styles.imageContainer}>
              <Image
                source={require('@/assets/splash-images/madeline-liu-LgSZnc4T0_o-unsplash.jpg')}
                style={styles.heroImage}
                contentFit="cover"
              />
              <View style={styles.imageOverlay}>
                <MaterialIcons 
                  name="cloud-upload" 
                  size={64} 
                  color="white" 
                />
              </View>
            </View>

            {/* Title */}
            <ThemedText type="title" style={styles.title}>
              Welcome to Upload
            </ThemedText>

            {/* Description */}
            <ThemedText style={styles.description}>
              Share your beautiful moments with the Photogram community!
            </ThemedText>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              <FeatureItem
                icon="public"
                title="Public by Default"
                description="Your uploads will be visible to the community, helping others discover beautiful photography."
                colors={colors}
              />
              
              <FeatureItem
                icon="photo-library"
                title="Up to 3 Photos"
                description="Select and upload up to 3 photos at a time to share your stories."
                colors={colors}
              />
              
              <FeatureItem
                icon="verified-user"
                title="Safe & Secure"
                description="Your photos are stored securely with Firebase, and you maintain full control."
                colors={colors}
              />

              <FeatureItem
                icon="favorite"
                title="Build Community"
                description="Connect with other photography enthusiasts and inspire each other."
                colors={colors}
              />
            </View>

            {/* Important Note */}
            <View style={[styles.noteContainer, { 
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
            }]}>
              <MaterialIcons 
                name="info-outline" 
                size={20} 
                color={colors.tint} 
                style={{ marginTop: 2 }}
              />
              <ThemedText style={styles.noteText}>
                All uploads are public and can be viewed by anyone in the community. 
                Please only share photos you're comfortable making public.
              </ThemedText>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  { opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={onContinue}
              >
                <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                  Got it, Let's Upload!
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  { 
                    borderColor: colors.text,
                    opacity: pressed ? 0.6 : 1 
                  }
                ]}
                onPress={onClose}
              >
                <ThemedText style={styles.buttonText}>
                  Maybe Later
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </ThemedView>
      </BlurView>
    </Modal>
  );
}

interface FeatureItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  colors: any;
}

function FeatureItem({ icon, title, description, colors }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.iconCircle, { backgroundColor: colors.tint + '20' }]}>
        <MaterialIcons name={icon} size={24} color={colors.tint} />
      </View>
      <View style={styles.featureTextContainer}>
        <ThemedText style={styles.featureTitle}>{title}</ThemedText>
        <ThemedText style={styles.featureDescription}>{description}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: height * 0.85,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 32,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.9,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  secondaryButton: {
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
});
