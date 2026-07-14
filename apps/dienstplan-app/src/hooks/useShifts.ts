import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { ShiftWithEmployee } from "@/types/database";

interface UseShiftsOptions {
  // Restrict to a single employee's shifts (employee read-only view).
  // Omit to load every shift in the schedule (admin view).
  employeeId?: string;
}

export function useShifts({ employeeId }: UseShiftsOptions = {}) {
  const [shifts, setShifts] = useState<ShiftWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("shifts")
      .select("*, employee:profiles!shifts_employee_id_fkey(id, full_name)")
      .order("starts_at", { ascending: true });

    if (employeeId) {
      query = query.eq("employee_id", employeeId);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError.message);
    } else {
      setError(null);
      setShifts((data ?? []) as unknown as ShiftWithEmployee[]);
    }
    setLoading(false);
  }, [employeeId]);

  useEffect(() => {
    fetchShifts();

    const channel = supabase
      .channel(`shifts-changes-${employeeId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts" },
        () => {
          // Any insert/update/delete triggers a refetch so every connected
          // client (admin + employees) stays in sync in real time.
          fetchShifts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId, fetchShifts]);

  return { shifts, loading, error, refresh: fetchShifts };
}
