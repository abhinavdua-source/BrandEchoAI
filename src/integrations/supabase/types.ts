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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      plans: {
        Row: {
          id: string
          name: string
          price_cents: number
          monthly_checks: number | null
          max_brands: number | null
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          price_cents: number
          monthly_checks?: number | null
          max_brands?: number | null
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          price_cents?: number
          monthly_checks?: number | null
          max_brands?: number | null
          sort_order?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          user_id: string
          plan_id: string
          status: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          current_period_end: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          plan_id?: string
          status?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          current_period_end?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          plan_id?: string
          status?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          current_period_end?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          user_id: string
          name: string
          summary: string
          attributes: Json
          preferred_terms: string[]
          banned_terms: string[]
          rules: string[]
          example_copy: string
          guidelines_text: string
          house_standard: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          summary?: string
          attributes?: Json
          preferred_terms?: string[]
          banned_terms?: string[]
          rules?: string[]
          example_copy?: string
          guidelines_text?: string
          house_standard?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          summary?: string
          attributes?: Json
          preferred_terms?: string[]
          banned_terms?: string[]
          rules?: string[]
          example_copy?: string
          guidelines_text?: string
          house_standard?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      checks: {
        Row: {
          id: string
          user_id: string
          brand_id: string | null
          brand_name: string
          channel: string
          title: string
          draft: string
          score: number
          verdict: string
          issues: Json
          rewrite: string
          model: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_id?: string | null
          brand_name: string
          channel?: string
          title?: string
          draft: string
          score: number
          verdict?: string
          issues?: Json
          rewrite?: string
          model: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string | null
          brand_name?: string
          channel?: string
          title?: string
          draft?: string
          score?: number
          verdict?: string
          issues?: Json
          rewrite?: string
          model?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checks_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      my_usage: {
        Args: Record<PropertyKey, never>
        Returns: { used: number; allowance: number | null; plan_id: string }[]
      }
      can_create_brand: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
