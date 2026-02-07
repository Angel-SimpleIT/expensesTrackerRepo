import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export type UserRole = 'user' | 'admin_b2b';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
  bot_user_id?: string | null;
  pairing_code?: string | null;
}