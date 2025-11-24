import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Dimensions, Animated } from 'react-native';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface SignInPromptModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Import splash images
const splashImages = [
    require('../assets/splash-images/y-s-zpWdIbZ_jwM-unsplash.jpg'),
    require('../assets/splash-images/laura-cleffmann-gRT7o73xua0-unsplash.jpg'),
    require('../assets/splash-images/spenser-sembrat-s7W2PXuYGcc-unsplash.jpg'),
    require('../assets/splash-images/madeline-liu-LgSZnc4T0_o-unsplash.jpg'),
    require('../assets/splash-images/nik-Us-QFSJjkas-unsplash.jpg'),
];

export default function SignInPromptModal({ 
    visible, 
    onClose, 
    title = "Sign In Required",
    message = "Please sign in to access this feature and unlock the full experience"
}: SignInPromptModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.9));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
        }
    }, [visible]);

    const handleLogin = () => {
        onClose();
        router.push('/auth/login');
    };

    const handleSignup = () => {
        onClose();
        router.push('/auth/signup');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <BlurView intensity={30} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
                
                <Animated.View 
                    style={[
                        styles.modalWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        }
                    ]}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.modalContainer, { 
                            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        }]}>
                            {/* Close Button */}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={styles.closeBlur}>
                                    <Ionicons name="close" size={20} color={colors.text} />
                                </BlurView>
                            </TouchableOpacity>

                            {/* Image Grid */}
                            <View style={styles.imageGrid}>
                                {splashImages.slice(0, 5).map((image, index) => (
                                    <View 
                                        key={index} 
                                        style={[
                                            styles.imageContainer,
                                            index === 0 && styles.largeImage,
                                            index > 0 && styles.smallImage,
                                        ]}
                                    >
                                        <Image 
                                            source={image} 
                                            style={styles.image} 
                                            contentFit="cover" 
                                            transition={300}
                                            cachePolicy="memory-disk"
                                            recyclingKey={`signin-modal-${index}`}
                                            allowDownscaling={true}
                                            priority="normal"
                                        />
                                    </View>
                                ))}
                                <LinearGradient
                                    colors={
                                        isDark
                                            ? ['transparent', 'rgba(20,20,20,0.4)', 'rgba(20,20,20,0.98)']
                                            : ['transparent', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.98)']
                                    }
                                    style={styles.imageOverlay}
                                />
                            </View>

                            {/* Icon */}
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircle, { 
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' 
                                }]}>
                                    <Ionicons name="lock-closed" size={32} color={colors.tint} />
                                </View>
                            </View>

                            {/* Content */}
                            <ThemedText type="title" style={styles.title}>
                                {title}
                            </ThemedText>

                            <ThemedText style={styles.message}>
                                {message}
                            </ThemedText>

                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                {/* Sign In Button with Gradient */}
                                <TouchableOpacity 
                                    style={styles.gradientButtonWrapper}
                                    onPress={handleLogin}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.gradientButton}
                                    >
                                        <ThemedText style={styles.primaryButtonText}>
                                            Sign In
                                        </ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Create Account Button */}
                                <TouchableOpacity 
                                    style={[styles.button, styles.secondaryButton, { 
                                        borderColor: colors.tint,
                                        backgroundColor: 'transparent' 
                                    }]}
                                    onPress={handleSignup}
                                    activeOpacity={0.7}
                                >
                                    <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                                        Create Account
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>

                            {/* Bottom Text */}
                            <ThemedText style={styles.footerText}>
                                Join our community of photographers
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalWrapper: {
        width: SCREEN_WIDTH - 48,
        maxWidth: 400,
    },
    modalContainer: {
        borderRadius: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10,
        elevation: 16,
        overflow: 'hidden',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        borderRadius: 20,
        overflow: 'hidden',
    },
    closeBlur: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageGrid: {
        height: 200,
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    imageContainer: {
        overflow: 'hidden',
    },
    largeImage: {
        width: '50%',
        height: '100%',
    },
    smallImage: {
        width: '25%',
        height: '50%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: -28,
        marginBottom: 16,
        zIndex: 1,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 26,
        fontWeight: '700',
        paddingHorizontal: 24,
    },
    message: {
        textAlign: 'center',
        marginBottom: 28,
        opacity: 0.7,
        fontSize: 15,
        lineHeight: 22,
        paddingHorizontal: 32,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 20,
    },
    gradientButtonWrapper: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        alignItems: 'center',
    },
    secondaryButton: {
        borderWidth: 2,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 13,
        opacity: 0.5,
        marginBottom: 24,
        paddingHorizontal: 24,
    },
});
