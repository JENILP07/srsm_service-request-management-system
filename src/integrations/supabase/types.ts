export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_departments: {
        Row: {
          cc_email: string | null
          created_at: string
          description: string | null
          id: string
          is_request_title_disabled: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          cc_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_request_title_disabled?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          cc_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_request_title_disabled?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_dept_persons: {
        Row: {
          created_at: string
          department_id: string
          description: string | null
          from_date: string
          id: string
          is_hod: boolean | null
          to_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          description?: string | null
          from_date?: string
          id?: string
          is_hod?: boolean | null
          to_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          description?: string | null
          from_date?: string
          id?: string
          is_hod?: boolean | null
          to_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_dept_persons_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "service_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_replies: {
        Row: {
          attachment_path: string | null
          created_at: string
          id: string
          reply_datetime: string
          reply_description: string
          service_request_id: string
          status_by_user_id: string | null
          status_datetime: string | null
          status_description: string | null
          status_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_path?: string | null
          created_at?: string
          id?: string
          reply_datetime?: string
          reply_description: string
          service_request_id: string
          status_by_user_id?: string | null
          status_datetime?: string | null
          status_description?: string | null
          status_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_path?: string | null
          created_at?: string
          id?: string
          reply_datetime?: string
          reply_description?: string
          service_request_id?: string
          status_by_user_id?: string | null
          status_datetime?: string | null
          status_description?: string | null
          status_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_replies_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_replies_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "service_request_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_statuses: {
        Row: {
          created_at: string
          css_class: string | null
          description: string | null
          id: string
          is_allowed_for_technician: boolean | null
          is_no_further_action_required: boolean | null
          is_open: boolean | null
          name: string
          sequence: number | null
          system_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          css_class?: string | null
          description?: string | null
          id?: string
          is_allowed_for_technician?: boolean | null
          is_no_further_action_required?: boolean | null
          is_open?: boolean | null
          name: string
          sequence?: number | null
          system_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          css_class?: string | null
          description?: string | null
          id?: string
          is_allowed_for_technician?: boolean | null
          is_no_further_action_required?: boolean | null
          is_open?: boolean | null
          name?: string
          sequence?: number | null
          system_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_request_type_wise_persons: {
        Row: {
          created_at: string
          description: string | null
          from_date: string | null
          id: string
          service_request_type_id: string
          to_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          from_date?: string | null
          id?: string
          service_request_type_id: string
          to_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          from_date?: string | null
          id?: string
          service_request_type_id?: string
          to_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_type_wise_persons_service_request_type_id_fkey"
            columns: ["service_request_type_id"]
            isOneToOne: false
            referencedRelation: "service_request_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_types: {
        Row: {
          created_at: string
          default_priority_level: string | null
          department_id: string | null
          description: string | null
          id: string
          is_mandatory_resource: boolean | null
          is_visible_resource: boolean | null
          name: string
          reminder_days_after_assignment: number | null
          sequence: number | null
          service_type_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_priority_level?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_mandatory_resource?: boolean | null
          is_visible_resource?: boolean | null
          name: string
          reminder_days_after_assignment?: number | null
          sequence?: number | null
          service_type_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_priority_level?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_mandatory_resource?: boolean | null
          is_visible_resource?: boolean | null
          name?: string
          reminder_days_after_assignment?: number | null
          sequence?: number | null
          service_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_types_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "service_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_types_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          approval_by_user_id: string | null
          approval_datetime: string | null
          approval_description: string | null
          approval_status: string | null
          assigned_by_user_id: string | null
          assigned_datetime: string | null
          assigned_description: string | null
          assigned_to_user_id: string | null
          created_at: string
          description: string
          id: string
          on_behalf_of_user_id: string | null
          priority_level: string
          request_datetime: string
          request_no: string
          requester_id: string
          service_request_type_id: string
          status_by_user_id: string | null
          status_datetime: string | null
          status_description: string | null
          status_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_by_user_id?: string | null
          approval_datetime?: string | null
          approval_description?: string | null
          approval_status?: string | null
          assigned_by_user_id?: string | null
          assigned_datetime?: string | null
          assigned_description?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          description: string
          id?: string
          on_behalf_of_user_id?: string | null
          priority_level?: string
          request_datetime?: string
          request_no: string
          requester_id: string
          service_request_type_id: string
          status_by_user_id?: string | null
          status_datetime?: string | null
          status_description?: string | null
          status_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_by_user_id?: string | null
          approval_datetime?: string | null
          approval_description?: string | null
          approval_status?: string | null
          assigned_by_user_id?: string | null
          assigned_datetime?: string | null
          assigned_description?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          description?: string
          id?: string
          on_behalf_of_user_id?: string | null
          priority_level?: string
          request_datetime?: string
          request_no?: string
          requester_id?: string
          service_request_type_id?: string
          status_by_user_id?: string | null
          status_datetime?: string | null
          status_description?: string | null
          status_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_service_request_type_id_fkey"
            columns: ["service_request_type_id"]
            isOneToOne: false
            referencedRelation: "service_request_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "service_request_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_for_staff: boolean | null
          is_for_student: boolean | null
          name: string
          sequence: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_for_staff?: boolean | null
          is_for_student?: boolean | null
          name: string
          sequence?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_for_staff?: boolean | null
          is_for_student?: boolean | null
          name?: string
          sequence?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hod" | "technician" | "requestor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hod", "technician", "requestor"],
    },
  },
} as const
