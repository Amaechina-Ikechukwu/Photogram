import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    message?: string;
}

export default function AuthModal({ visible, onClose, message = "Please sign in to continue" }: AuthModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

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
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={colorScheme === 'dark' ? 'dark' : 'light'} />
                
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <ThemedView style={[styles.modalContainer, { 
                        backgroundColor: colorScheme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>

                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-closed" size={48} color={colors.tint} />
                        </View>

                        <ThemedText type="title" style={styles.title}>
                            Authentication Required
                        </ThemedText>

                        <ThemedText style={styles.message}>
                            {message}
                        </ThemedText>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, styles.primaryButton, { backgroundColor: colors.tint }]}
                                onPress={handleLogin}
                            >
                                <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                                    Sign In
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.button, styles.secondaryButton, { 
                                    borderColor: colors.tint,
                                    backgroundColor: 'transparent' 
                                }]}
                                onPress={handleSignup}
                            >
                                <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                                    Create Account
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: Dimensions.get('window').width - 48,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
        padding: 4,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 24,
    },
    message: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
        fontSize: 16,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButton: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    secondaryButton: {
        borderWidth: 2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: '#fff',
    },
});
