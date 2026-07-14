import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface DateTimeFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

// Android exposes separate date/time pickers; this walks date -> time on
// Android and lets iOS show its combined inline picker.
export function DateTimeField({ label, value, onChange }: DateTimeFieldProps) {
  const [stage, setStage] = useState<"idle" | "date" | "time">("idle");

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (event.type === "dismissed") {
      setStage("idle");
      return;
    }
    if (!selected) return;

    if (Platform.OS === "android" && stage === "date") {
      const merged = new Date(value);
      merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      onChange(merged);
      setStage("time");
      return;
    }

    if (Platform.OS === "android" && stage === "time") {
      const merged = new Date(value);
      merged.setHours(selected.getHours(), selected.getMinutes());
      onChange(merged);
      setStage("idle");
      return;
    }

    onChange(selected);
  }

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.label}>
        {label}
      </Text>
      <Button
        mode="outlined"
        icon="calendar-clock-outline"
        onPress={() => setStage("date")}
      >
        {value.toLocaleDateString("de-DE")} · {value.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
      </Button>

      {stage !== "idle" ? (
        <DateTimePicker
          value={value}
          mode={Platform.OS === "android" ? stage : "datetime"}
          is24Hour
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 6 },
});
