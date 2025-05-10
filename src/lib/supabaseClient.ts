import { createClient } from '@supabase/supabase-js';

// Make sure these env-vars are set in your Bolt integrations
export const supabase = createClient(
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Shape of a row in public.users
export interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'technician';
}
