import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { app } from "@/firebaseConfig";
import { router } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, useColorScheme } from "react-native";
import { useToast } from "@/components/ToastProvider";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const toast = useToast();

  const auth = getAuth(app);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      toast.show("Email and password are required", { type: "error" });
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.show("Logged in successfully", { type: "success" });
      router.replace("/(tabs)"); // go to tabs after login
    } catch (err: any) {
      const msg = err?.message ?? "Login failed";
      setError(msg);
      toast.show(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome Back 
      </ThemedText>

      <TextInput
        editable={!loading}
        style={[styles.input, { color: colorScheme === "dark" ? "#fff" : "#000", opacity: loading ? 0.6 : 1 }]}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        editable={!loading}
        style={[styles.input, { color: colorScheme === "dark" ? "#fff" : "#000", opacity: loading ? 0.6 : 1 }]}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      <Pressable style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Login</ThemedText>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/auth/signup")}>
        <ThemedText style={styles.linkText}>
          Don’t have an account? Sign Up
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  linkText: {
    textAlign: "center",
    color: "#007AFF",
    marginTop: 8,
  },
});
