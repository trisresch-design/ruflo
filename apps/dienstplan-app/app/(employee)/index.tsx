import { SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Card, Chip, Text } from "react-native-paper";

import { useAuth } from "@/context/AuthContext";
import { useShifts } from "@/hooks/useShifts";
import type { ShiftWithEmployee } from "@/types/database";

function groupByDay(shifts: ShiftWithEmployee[]) {
  const groups = new Map<string, ShiftWithEmployee[]>();

  for (const shift of shifts) {
    const dayKey = new Date(shift.starts_at).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey)!.push(shift);
  }

  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

export default function EmployeeSchedule() {
  const { profile, signOut } = useAuth();
  const { shifts, loading, refresh } = useShifts({ employeeId: profile?.id });

  const sections = groupByDay(shifts);

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.Content title="Mein Dienstplan" subtitle={profile?.full_name} />
        <Appbar.Action icon="logout" onPress={signOut} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          onRefresh={refresh}
          refreshing={loading}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <Text variant="titleMedium" style={styles.sectionHeader}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <Card style={styles.card} mode="elevated" elevation={2}>
              <Card.Title
                title={item.title}
                subtitle={`${new Date(item.starts_at).toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} – ${new Date(item.ends_at).toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              />
              {item.location ? (
                <Card.Content>
                  <Chip icon="map-marker-outline">{item.location}</Chip>
                </Card.Content>
              ) : null}
            </Card>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Dir sind aktuell keine Schichten zugewiesen.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { marginTop: 40 },
  list: { paddingBottom: 24 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    opacity: 0.7,
  },
  card: { marginHorizontal: 16, marginVertical: 6 },
  empty: { textAlign: "center", marginTop: 40, opacity: 0.6 },
});
