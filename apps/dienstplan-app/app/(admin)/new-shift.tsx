import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Appbar, Button, HelperText, RadioButton, Text, TextInput } from "react-native-paper";

import { DateTimeField } from "@/components/DateTimeField";
import { useEmployees } from "@/hooks/useEmployees";
import { createShift } from "@/lib/shifts";

function roundToNextHour(date: Date) {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next;
}

export default function NewShiftScreen() {
  const { employees } = useEmployees();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState(() => roundToNextHour(new Date()));
  const [endsAt, setEndsAt] = useState(() => {
    const end = roundToNextHour(new Date());
    end.setHours(end.getHours() + 8);
    return end;
  });
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      setError("Bitte gib einen Titel für die Schicht an.");
      return;
    }
    if (endsAt <= startsAt) {
      setError("Das Ende muss nach dem Start liegen.");
      return;
    }

    setError(null);
    setSubmitting(true);
    const { error: createError } = await createShift({
      title: title.trim(),
      location: location.trim() || null,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      employeeId,
    });
    setSubmitting(false);

    if (createError) {
      setError(createError.message);
      return;
    }
    router.back();
  }

  return (
    <>
      <Appbar.Header elevated>
        <Appbar.Action icon="close" onPress={() => router.back()} />
        <Appbar.Content title="Neue Schicht" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Titel"
          mode="outlined"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          label="Ort (optional)"
          mode="outlined"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />

        <DateTimeField label="Start" value={startsAt} onChange={setStartsAt} />
        <DateTimeField label="Ende" value={endsAt} onChange={setEndsAt} />

        <Text variant="labelLarge" style={styles.label}>
          Mitarbeiter zuweisen (optional)
        </Text>
        <RadioButton.Group
          value={employeeId ?? ""}
          onValueChange={(value) => setEmployeeId(value === "" ? null : value)}
        >
          <RadioButton.Item label="Später zuweisen" value="" />
          {employees.map((employee) => (
            <RadioButton.Item key={employee.id} label={employee.full_name} value={employee.id} />
          ))}
        </RadioButton.Group>

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button mode="contained" onPress={handleSave} loading={submitting} disabled={submitting}>
          Schicht speichern
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  input: { marginBottom: 12 },
  label: { marginTop: 8, marginBottom: 6 },
});
