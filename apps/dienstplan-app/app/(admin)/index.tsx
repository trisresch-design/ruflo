import { router } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  FAB,
  Portal,
  RadioButton,
  Text,
} from "react-native-paper";

import { ShiftCard } from "@/components/ShiftCard";
import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/hooks/useEmployees";
import { useShifts } from "@/hooks/useShifts";
import { assignShift, deleteShift } from "@/lib/shifts";
import type { ShiftWithEmployee } from "@/types/database";

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { shifts, loading, refresh } = useShifts();
  const { employees } = useEmployees();

  const [assignTarget, setAssignTarget] = useState<ShiftWithEmployee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShiftWithEmployee | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleAssign(employeeId: string | null) {
    if (!assignTarget) return;
    setBusy(true);
    await assignShift(assignTarget.id, employeeId);
    setBusy(false);
    setAssignTarget(null);
    refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    await deleteShift(deleteTarget.id);
    setBusy(false);
    setDeleteTarget(null);
    refresh();
  }

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.Content title="Dienstplan" subtitle={profile?.full_name ?? "Admin"} />
        <Appbar.Action icon="logout" onPress={signOut} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => (
            <ShiftCard
              shift={item}
              onDelete={() => setDeleteTarget(item)}
              onAssign={() => setAssignTarget(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Noch keine Schichten angelegt. Tippe auf "+".</Text>
          }
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => router.push("/(admin)/new-shift")} />

      <Portal>
        <Dialog visible={!!assignTarget} onDismiss={() => setAssignTarget(null)}>
          <Dialog.Title>Mitarbeiter zuweisen</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={assignTarget?.employee_id ?? ""}
              onValueChange={(value) => handleAssign(value === "" ? null : value)}
            >
              <RadioButton.Item label="Nicht zugewiesen" value="" disabled={busy} />
              {employees.map((employee) => (
                <RadioButton.Item
                  key={employee.id}
                  label={employee.full_name}
                  value={employee.id}
                  disabled={busy}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAssignTarget(null)}>Schließen</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Schicht löschen?</Dialog.Title>
          <Dialog.Content>
            <Text>{deleteTarget?.title} wird endgültig entfernt.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)} disabled={busy}>
              Abbrechen
            </Button>
            <Button onPress={handleDelete} loading={busy} textColor="red">
              Löschen
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { marginTop: 40 },
  list: { paddingVertical: 8, paddingBottom: 96 },
  empty: { textAlign: "center", marginTop: 40, opacity: 0.6 },
  fab: { position: "absolute", right: 16, bottom: 24 },
});
