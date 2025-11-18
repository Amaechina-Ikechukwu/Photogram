import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useLayoutEffect } from "react";
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Colors } from "@/constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from "expo-router";
import GlassBackground from "@/components/ui/GlassBackground";
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen() {
    const authContext = useAuth();
    const user = authContext?.user;
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const navigation = useNavigation();
    
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Edit Profile',
            headerBackTitle: 'Profile',
        });
    }, [navigation]);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a name");
            return;
        }

        if (!user) {
            Alert.alert("Error", "You must be logged in to update your profile");
            return;
        }

        setLoading(true);
        try {
            const token = await user.getIdToken();
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            
            const response = await fetch(`${apiUrl}/users`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                Alert.alert("Success", "Profile updated successfully!", [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    }
                ]);
            } else {
                Alert.alert("Error", result.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            Alert.alert("Error", "An error occurred while updating your profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedView style={styles.content}>
                        <ThemedView style={styles.iconContainer}>
                            <Ionicons name="person-circle-outline" size={80} color={colors.icon} />
                        </ThemedView>

                        <ThemedText style={styles.label}>Name</ThemedText>
                        <GlassBackground style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.input, 
                                    { 
                                        color: colors.text,
                                        backgroundColor: colorScheme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
                                    }
                                ]}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.icon}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                        </GlassBackground>

                        <TouchableOpacity
                            style={[
                                styles.updateButton,
                                loading && styles.updateButtonDisabled
                            ]}
                            onPress={handleUpdateProfile}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="white" style={styles.buttonIcon} />
                                        <ThemedText style={styles.updateButtonText}>
                                            Update Profile
                                        </ThemedText>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <ThemedText style={styles.helpText}>
                            Update your display name to personalize your profile
                        </ThemedText>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    input: {
        padding: 16,
        fontSize: 16,
    },
    updateButton: {
        borderRadius: 12,
        marginTop: 8,
        overflow: 'hidden',
    },
    updateButtonDisabled: {
        opacity: 0.6,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    buttonIcon: {
        marginRight: 8,
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    helpText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
        opacity: 0.6,
    },
});
