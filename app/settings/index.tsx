import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useLayoutEffect } from "react";
import { StyleSheet, View, TouchableOpacity, useColorScheme, ScrollView, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import { router, useNavigation } from 'expo-router';

export default function SettingsScreen() {
    const authContext = useAuth();
    const user = authContext?.user;
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: 'Settings',
            headerBackTitle: 'Back',
        });
    }, [navigation]);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await authContext?.signOut();
                            router.replace('/');
                        } catch (error) {
                            console.error("Logout error:", error);
                            Alert.alert("Error", "Failed to logout. Please try again.");
                        } finally {
                            setIsLoggingOut(false);
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ 
        icon, 
        title, 
        onPress, 
        showChevron = true,
        destructive = false 
    }: { 
        icon: string; 
        title: string; 
        onPress: () => void; 
        showChevron?: boolean;
        destructive?: boolean;
    }) => (
        <TouchableOpacity 
            style={[
                styles.settingItem,
                { borderBottomColor: colors.icon + '30' }
            ]}
            onPress={onPress}
        >
            <View style={styles.settingItemLeft}>
                <Ionicons 
                    name={icon as any} 
                    size={24} 
                    color={destructive ? '#FF3B30' : colors.text} 
                />
                <ThemedText 
                    style={[
                        styles.settingItemText,
                        destructive && { color: '#FF3B30' }
                    ]}
                >
                    {title}
                </ThemedText>
            </View>
            {showChevron && (
                <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={colors.icon} 
                />
            )}
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Account Section */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
                        <View style={styles.sectionContent}>
                            <SettingItem
                                icon="person-outline"
                                title="Edit Profile"
                                onPress={() => router.push('/profile/edit')}
                            />
                            <SettingItem
                                icon="mail-outline"
                                title="Email"
                                onPress={() => Alert.alert("Email", user?.email || "Not available")}
                            />
                        </View>
                    </View>

                    {/* Preferences Section */}
                    {/* <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
                        <View style={styles.sectionContent}>
                            <SettingItem
                                icon="notifications-outline"
                                title="Notifications"
                                onPress={() => Alert.alert("Coming Soon", "Notification settings will be available soon")}
                            />
                            <SettingItem
                                icon="moon-outline"
                                title="Appearance"
                                onPress={() => Alert.alert("Coming Soon", "Theme settings will be available soon")}
                            />
                        </View>
                    </View> */}

                    {/* Content Section */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Content</ThemedText>
                        <View style={styles.sectionContent}>
                            <SettingItem
                                icon="images-outline"
                                title="My Photos"
                                onPress={() => router.push('/(tabs)/profile')}
                            />
                            <SettingItem
                                icon="download-outline"
                                title="Downloads"
                                onPress={() => Alert.alert("Coming Soon", "Download management will be available soon")}
                            />
                        </View>
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>About</ThemedText>
                        <View style={styles.sectionContent}>
                            <SettingItem
                                icon="information-circle-outline"
                                title="About Photogram"
                                onPress={() => Alert.alert("Photogram", "Version 1.0.0")}
                            />
                            <SettingItem
                                icon="help-circle-outline"
                                title="Help & Support"
                                onPress={() => Alert.alert("Coming Soon", "Help & Support will be available soon")}
                            />
                            <SettingItem
                                icon="document-text-outline"
                                title="Privacy Policy"
                                onPress={() => Alert.alert("Coming Soon", "Privacy Policy will be available soon")}
                            />
                            <SettingItem
                                icon="shield-checkmark-outline"
                                title="Terms of Service"
                                onPress={() => Alert.alert("Coming Soon", "Terms of Service will be available soon")}
                            />
                        </View>
                    </View>

                    {/* Logout Button */}
                    <View style={styles.section}>
                        <View style={styles.sectionContent}>
                            <SettingItem
                                icon="log-out-outline"
                                title={isLoggingOut ? "Logging out..." : "Logout"}
                                onPress={handleLogout}
                                showChevron={false}
                                destructive={true}
                            />
                        </View>
                    </View>
                </ScrollView>
            </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.6,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    sectionContent: {
        backgroundColor: 'transparent',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    settingItemText: {
        fontSize: 16,
    },
});
