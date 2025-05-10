import { createClient } from '@supabase/supabase-js';

// These must match your .env prefixes
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Please check your .env file and restart the server.'
  );
}

export const supabase = createClient(url, key);

// Shape of a row in public.users
export interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'technician';
}
