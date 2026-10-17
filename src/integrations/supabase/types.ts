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
      brands: {
        Row: {
          attributes: Json
          banned_terms: string[]
          created_at: string
          example_copy: string
          guidelines_text: string
          house_standard: number
          id: string
          name: string
          preferred_terms: string[]
          rules: string[]
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attributes?: Json
          banned_terms?: string[]
          created_at?: string
          example_copy?: string
          guidelines_text?: string
          house_standard?: number
          id?: string
          name: string
          preferred_terms?: string[]
          rules?: string[]
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          attributes?: Json
          banned_terms?: string[]
          created_at?: string
          example_copy?: string
          guidelines_text?: string
          house_standard?: number
          id?: string
          name?: string
          preferred_terms?: string[]
          rules?: string[]
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checks: {
        Row: {
          brand_id: string | null
          brand_name: string
          channel: string
          created_at: string
          draft: string
          id: string
          issues: Json
          model: string
          rewrite: string
          score: number
          title: string
          user_id: string
          verdict: string
        }
        Insert: {
          brand_id?: string | null
          brand_name: string
          channel?: string
          created_at?: string
          draft: string
          id?: string
          issues?: Json
          model: string
          rewrite?: string
          score: number
          title?: string
          user_id: string
          verdict?: string
        }
        Update: {
          brand_id?: string | null
          brand_name?: string
          channel?: string
          created_at?: string
          draft?: string
          id?: string
          issues?: Json
          model?: string
          rewrite?: string
          score?: number
          title?: string
          user_id?: string
          verdict?: string
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
      demo_requests: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          team_size: string
          user_id: string | null
        }
        Insert: {
          company?: string
          created_at?: string
          email: string
          id?: string
          message?: string
          name: string
          team_size?: string
          user_id?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          team_size?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          max_brands: number | null
          monthly_checks: number | null
          name: string
          price_cents: number
          sort_order: number
        }
        Insert: {
          id: string
          max_brands?: number | null
          monthly_checks?: number | null
          name: string
          price_cents: number
          sort_order?: number
        }
        Update: {
          id?: string
          max_brands?: number | null
          monthly_checks?: number | null
          name?: string
          price_cents?: number
          sort_order?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          plan_id: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          plan_id?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          plan_id?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_brand: { Args: never; Returns: boolean }
      current_plan: {
        Args: { uid: string }
        Returns: {
          id: string
          max_brands: number | null
          monthly_checks: number | null
          name: string
          price_cents: number
          sort_order: number
        }
        SetofOptions: {
          from: "*"
          to: "plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_usage: {
        Args: never
        Returns: {
          allowance: number
          plan_id: string
          used: number
        }[]
      }
      usage_this_month: {
        Args: { uid: string }
        Returns: {
          allowance: number
          plan_id: string
          used: number
        }[]
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
