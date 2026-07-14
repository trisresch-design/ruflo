export type UserRole = "admin" | "employee";

// Mirrors the shape `supabase gen types typescript` would emit for
// supabase/schema.sql. Regenerate with the Supabase CLI once the project is
// live and keep this file as the fallback/reference definition.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      shifts: {
        Row: {
          id: string;
          title: string;
          location: string | null;
          starts_at: string;
          ends_at: string;
          employee_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          location?: string | null;
          starts_at: string;
          ends_at: string;
          employee_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          location?: string | null;
          starts_at?: string;
          ends_at?: string;
          employee_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Shift = Database["public"]["Tables"]["shifts"]["Row"];

export interface ShiftWithEmployee extends Shift {
  employee: Pick<Profile, "id" | "full_name"> | null;
}
