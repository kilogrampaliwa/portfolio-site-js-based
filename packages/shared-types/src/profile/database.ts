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
      about: {
        Row: {
          id: number
          bio_short: string | null
          bio_long: string | null
          target_roles: string[]
          is_generated: boolean
          updated_at: string
        }
        Insert: {
          id?: never
          bio_short?: string | null
          bio_long?: string | null
          target_roles?: string[]
          is_generated?: boolean
          updated_at?: string
        }
        Update: {
          id?: never
          bio_short?: string | null
          bio_long?: string | null
          target_roles?: string[]
          is_generated?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          id: number
          title: string
          company: string
          employment_type: string | null
          location: string | null
          location_type: string | null
          description: string | null
          achievements: string[]
          start_date: string
          end_date: string | null
          display_order: number
          is_public: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          title: string
          company: string
          employment_type?: string | null
          location?: string | null
          location_type?: string | null
          description?: string | null
          achievements?: string[]
          start_date: string
          end_date?: string | null
          display_order?: number
          is_public?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          title?: string
          company?: string
          employment_type?: string | null
          location?: string | null
          location_type?: string | null
          description?: string | null
          achievements?: string[]
          start_date?: string
          end_date?: string | null
          display_order?: number
          is_public?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: number
          title: string
          type: string | null
          status: string
          description: string | null
          highlights: string[]
          repo_url: string | null
          demo_url: string | null
          start_date: string | null
          end_date: string | null
          display_order: number
          is_public: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          title: string
          type?: string | null
          status?: string
          description?: string | null
          highlights?: string[]
          repo_url?: string | null
          demo_url?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          is_public?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          title?: string
          type?: string | null
          status?: string
          description?: string | null
          highlights?: string[]
          repo_url?: string | null
          demo_url?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          is_public?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      qualifications: {
        Row: {
          id: number
          title: string
          issuer: string
          type: string
          description: string | null
          credential_id: string | null
          credential_url: string | null
          issue_date: string
          expiry_date: string | null
          display_order: number
          is_public: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          title: string
          issuer: string
          type: string
          description?: string | null
          credential_id?: string | null
          credential_url?: string | null
          issue_date: string
          expiry_date?: string | null
          display_order?: number
          is_public?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          title?: string
          issuer?: string
          type?: string
          description?: string | null
          credential_id?: string | null
          credential_url?: string | null
          issue_date?: string
          expiry_date?: string | null
          display_order?: number
          is_public?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: number
          name: string
          category: string
          competency_level: string | null
          years_of_experience: number | null
          description: string | null
          display_order: number
          is_public: boolean
        }
        Insert: {
          id?: never
          name: string
          category: string
          competency_level?: string | null
          years_of_experience?: number | null
          description?: string | null
          display_order?: number
          is_public?: boolean
        }
        Update: {
          id?: never
          name?: string
          category?: string
          competency_level?: string | null
          years_of_experience?: number | null
          description?: string | null
          display_order?: number
          is_public?: boolean
        }
        Relationships: []
      }
      experience_skills: {
        Row: {
          experience_id: number
          skill_id: number
        }
        Insert: {
          experience_id: number
          skill_id: number
        }
        Update: {
          experience_id?: number
          skill_id?: number
        }
        Relationships: []
      }
      project_skills: {
        Row: {
          project_id: number
          skill_id: number
        }
        Insert: {
          project_id: number
          skill_id: number
        }
        Update: {
          project_id?: number
          skill_id?: number
        }
        Relationships: []
      }
      qualification_skills: {
        Row: {
          qualification_id: number
          skill_id: number
        }
        Insert: {
          qualification_id: number
          skill_id: number
        }
        Update: {
          qualification_id?: number
          skill_id?: number
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          id: string
          key_hash: string
          client_name: string
          revoked_at: string | null
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          key_hash: string
          client_name: string
          revoked_at?: string | null
          last_used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          key_hash?: string
          client_name?: string
          revoked_at?: string | null
          last_used_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_experience: {
        Row: {
          id: number
          title: string
          company: string
          employment_type: string | null
          location: string | null
          location_type: string | null
          description: string | null
          achievements: string[]
          start_date: string
          end_date: string | null
          display_order: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Relationships: []
      }
      v_projects: {
        Row: {
          id: number
          title: string
          type: string | null
          status: string
          description: string | null
          highlights: string[]
          repo_url: string | null
          demo_url: string | null
          start_date: string | null
          end_date: string | null
          display_order: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Relationships: []
      }
      v_qualifications: {
        Row: {
          id: number
          title: string
          issuer: string
          type: string
          description: string | null
          credential_id: string | null
          credential_url: string | null
          issue_date: string
          expiry_date: string | null
          display_order: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Relationships: []
      }
      v_skills: {
        Row: {
          id: number
          name: string
          category: string
          competency_level: string | null
          years_of_experience: number | null
          description: string | null
          display_order: number
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
