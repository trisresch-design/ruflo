import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { session, profile, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;
  if (profile?.role !== "admin") return <Redirect href="/(employee)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new-shift" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}
