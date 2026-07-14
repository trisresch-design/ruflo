import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function EmployeeLayout() {
  const { session, profile, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;
  if (profile?.role !== "employee") return <Redirect href="/(admin)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
