import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Profile = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  id: string;
  profile_id: string;
  unit: 'oz' | 'l';
  daily_goal_volume: number;
  rachel_bottles_per_goal: number;
  andy_bottles_per_goal: number;
  celebration_enabled: boolean;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type IntakeEntry = {
  id: string;
  profile_id: string;
  user_name: 'rachel' | 'andy';
  volume_oz: number;
  timestamp: string;
  created_at: string;
};

export type CelebratedDate = {
  id: string;
  profile_id: string;
  date: string;
  created_at: string;
};
