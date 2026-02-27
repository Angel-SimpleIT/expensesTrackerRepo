import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables (.env.local)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'admin_b2b';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
  home_currency?: string;
  bot_user_id?: string | null;
  pairing_code?: string | null;
  pairing_code_expires_at?: string | null;
  timezone?: string;
}