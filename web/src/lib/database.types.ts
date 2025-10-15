export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          calories_goal: number;
          protein_goal: number;
          carbs_goal: number;
          fat_goal: number;
          calories_intake: number | null;
          protein_intake: number | null;
          carbs_intake: number | null;
          fat_intake: number | null;
          basal_calories: number | null;
          active_calories: number | null;
          hydration_oz: number | null;
          hydration_target_oz: number | null;
          weight: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date: string;
          calories_goal: number;
          protein_goal: number;
          carbs_goal: number;
          fat_goal: number;
          calories_intake?: number | null;
          protein_intake?: number | null;
          carbs_intake?: number | null;
          fat_intake?: number | null;
          basal_calories?: number | null;
          active_calories?: number | null;
          hydration_oz?: number | null;
          hydration_target_oz?: number | null;
          weight?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          calories_goal?: number;
          protein_goal?: number;
          carbs_goal?: number;
          fat_goal?: number;
          calories_intake?: number | null;
          protein_intake?: number | null;
          carbs_intake?: number | null;
          fat_intake?: number | null;
          basal_calories?: number | null;
          active_calories?: number | null;
          hydration_oz?: number | null;
          hydration_target_oz?: number | null;
          weight?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          daily_log_id: string;
          name: string;
          logged_at: string | null;
          calories: number | null;
          protein: number | null;
          carbs: number | null;
          fat: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          daily_log_id: string;
          name: string;
          logged_at?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          daily_log_id?: string;
          name?: string;
          logged_at?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      meal_items: {
        Row: {
          id: string;
          meal_id: string;
          name: string;
          serving: string | null;
          calories: number | null;
          protein: number | null;
          carbs: number | null;
          fat: number | null;
        };
        Insert: {
          id?: string;
          meal_id: string;
          name: string;
          serving?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
        };
        Update: {
          id?: string;
          meal_id?: string;
          name?: string;
          serving?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          calories: number | null;
          protein: number | null;
          carbs: number | null;
          fat: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      daily_notes: {
        Row: {
          id: string;
          daily_log_id: string;
          note: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          daily_log_id: string;
          note: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          daily_log_id?: string;
          note?: string;
          created_at?: string | null;
      };
      Relationships: [];
    };
    user_settings: {
      Row: {
        user_id: string;
        calories_goal: number | null;
        protein_goal: number | null;
        carbs_goal: number | null;
        fat_goal: number | null;
        basal_calories: number | null;
        active_calories: number | null;
        hydration_target_oz: number | null;
        weight_lbs: number | null;
        bmr_weight_lbs: number | null;
        bmr_height_inches: number | null;
        bmr_age: number | null;
        bmr_sex: string | null;
        created_at: string | null;
        updated_at: string | null;
      };
      Insert: {
        user_id: string;
        calories_goal?: number | null;
        protein_goal?: number | null;
        carbs_goal?: number | null;
        fat_goal?: number | null;
        basal_calories?: number | null;
        active_calories?: number | null;
        hydration_target_oz?: number | null;
        weight_lbs?: number | null;
        bmr_weight_lbs?: number | null;
        bmr_height_inches?: number | null;
        bmr_age?: number | null;
        bmr_sex?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Update: {
        user_id?: string;
        calories_goal?: number | null;
        protein_goal?: number | null;
        carbs_goal?: number | null;
        fat_goal?: number | null;
        basal_calories?: number | null;
        active_calories?: number | null;
        hydration_target_oz?: number | null;
        weight_lbs?: number | null;
        bmr_weight_lbs?: number | null;
        bmr_height_inches?: number | null;
        bmr_age?: number | null;
        bmr_sex?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Relationships: [
        {
          foreignKeyName: "user_settings_user_id_fkey";
          columns: ["user_id"];
          referencedRelation: "profiles";
          referencedColumns: ["id"];
        },
      ];
    };
  };
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Record<string, never>;
  };
};
