export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      payments: {
        Row: {
          amount: number
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          date: string
          id: string
          mode: string
          note: string | null
          student_id: string
        }
        Insert: {
          amount: number
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date: string
          id?: string
          mode?: string
          note?: string | null
          student_id: string
        }
        Update: {
          amount?: number
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date?: string
          id?: string
          mode?: string
          note?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pgs: {
        Row: {
          address: string | null
          amenities: Json | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          manager_id: string | null
          monthly_rent: number | null
          name: string
          occupied_rooms: number | null
          pg_type: string | null
          revenue: number | null
          total_rooms: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          manager_id?: string | null
          monthly_rent?: number | null
          name: string
          occupied_rooms?: number | null
          pg_type?: string | null
          revenue?: number | null
          total_rooms?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          manager_id?: string | null
          monthly_rent?: number | null
          name?: string
          occupied_rooms?: number | null
          pg_type?: string | null
          revenue?: number | null
          total_rooms?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pgs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_pgs: Json | null
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          assigned_pgs?: Json | null
          created_at?: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          assigned_pgs?: Json | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          id: string
          occupant_contact: string | null
          occupant_name: string | null
          pg_id: string
          rent: number
          room_number: string
          room_type: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          occupant_contact?: string | null
          occupant_name?: string | null
          pg_id: string
          rent: number
          room_number: string
          room_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          occupant_contact?: string | null
          occupant_name?: string | null
          pg_id?: string
          rent?: number
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          created_at: string
          deposit: number
          end_date: string
          id: string
          name: string
          occupation: string | null
          pg_id: string | null
          phone: string | null
          room_id: string | null
          start_date: string
          total_fees: number
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          created_at?: string
          deposit?: number
          end_date: string
          id?: string
          name: string
          occupation?: string | null
          pg_id?: string | null
          phone?: string | null
          room_id?: string | null
          start_date: string
          total_fees?: number
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          created_at?: string
          deposit?: number
          end_date?: string
          id?: string
          name?: string
          occupation?: string | null
          pg_id?: string | null
          phone?: string | null
          room_id?: string | null
          start_date?: string
          total_fees?: number
        }
        Relationships: [
          {
            foreignKeyName: "students_pg_id_fkey"
            columns: ["pg_id"]
            isOneToOne: false
            referencedRelation: "pgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          assignedPGs: Json | null
          created_at: string
          email: string
          id: string
          lastLogin: string | null
          name: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          assignedPGs?: Json | null
          created_at?: string
          email: string
          id?: string
          lastLogin?: string | null
          name: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assignedPGs?: Json | null
          created_at?: string
          email?: string
          id?: string
          lastLogin?: string | null
          name?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
