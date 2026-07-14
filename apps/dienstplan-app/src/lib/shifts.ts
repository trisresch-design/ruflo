import { supabase } from "@/lib/supabase";
import type { Shift } from "@/types/database";

export interface NewShiftInput {
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string;
  employeeId: string | null;
}

export async function createShift(input: NewShiftInput) {
  const { data: userData } = await supabase.auth.getUser();

  return supabase
    .from("shifts")
    .insert({
      title: input.title,
      location: input.location,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      employee_id: input.employeeId,
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
}

export async function assignShift(shiftId: string, employeeId: string | null) {
  return supabase.from("shifts").update({ employee_id: employeeId } satisfies Partial<Shift>).eq("id", shiftId);
}

export async function deleteShift(shiftId: string) {
  return supabase.from("shifts").delete().eq("id", shiftId);
}
