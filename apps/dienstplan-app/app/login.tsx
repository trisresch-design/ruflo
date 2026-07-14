import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";

import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (signInError) {
      setError(signInError);
      return;
    }
    router.replace("/");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Card style={styles.card} mode="elevated" elevation={3}>
        <Card.Title title="Dienstplan" subtitle="Bitte melde dich an" />
        <Card.Content>
          <TextInput
            label="E-Mail"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            label="Passwort"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          {error ? <HelperText type="error">{error}</HelperText> : null}
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={submitting}
            disabled={submitting || !email || !password}
          >
            Anmelden
          </Button>
        </Card.Actions>
      </Card>
      <Text variant="bodySmall" style={styles.hint}>
        Konten werden vom Admin über Supabase angelegt.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  card: { borderRadius: 16 },
  input: { marginBottom: 12 },
  actions: { justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 16 },
  hint: { textAlign: "center", marginTop: 16, opacity: 0.6 },
});
