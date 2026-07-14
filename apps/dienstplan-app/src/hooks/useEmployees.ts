import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export function useEmployees() {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee")
      .order("full_name", { ascending: true })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) console.warn("Failed to load employees:", error.message);
        setEmployees(data ?? []);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { employees, loading };
}
