import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session || !profile) {
    return <Redirect href="/login" />;
  }

  return <Redirect href={profile.role === "admin" ? "/(admin)" : "/(employee)"} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
