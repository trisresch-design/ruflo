import { StyleSheet, View } from "react-native";
import { Card, Chip, IconButton, Text } from "react-native-paper";

import type { ShiftWithEmployee } from "@/types/database";

function formatRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateLabel = start.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const timeLabel = `${start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString(
    "de-DE",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
  return { dateLabel, timeLabel };
}

interface ShiftCardProps {
  shift: ShiftWithEmployee;
  onDelete?: () => void;
  onAssign?: () => void;
}

export function ShiftCard({ shift, onDelete, onAssign }: ShiftCardProps) {
  const { dateLabel, timeLabel } = formatRange(shift.starts_at, shift.ends_at);

  return (
    <Card style={styles.card} mode="elevated" elevation={2}>
      <Card.Title
        title={shift.title}
        subtitle={`${dateLabel} · ${timeLabel}`}
        right={(props) =>
          onDelete ? <IconButton {...props} icon="delete-outline" onPress={onDelete} /> : null
        }
      />
      <Card.Content>
        <View style={styles.row}>
          {shift.location ? <Chip icon="map-marker-outline">{shift.location}</Chip> : null}
          <Chip
            icon="account-outline"
            onPress={onAssign}
            mode={shift.employee ? "flat" : "outlined"}
          >
            {shift.employee?.full_name ?? "Nicht zugewiesen"}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
