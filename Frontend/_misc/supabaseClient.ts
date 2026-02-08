
import { createClient } from '@supabase/supabase-js';

const isPlaceholder = (url: string) => !url || url.includes('your-project.supabase.co');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';

// If it's a placeholder, we create a proxy or a dummy client that doesn't trigger fetch
// This prevents the browser from trying to hit a non-existent URL on initialization
export const supabase = isPlaceholder(supabaseUrl) 
  ? {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: new Error("Supabase is not configured.") }),
        signUp: async () => ({ error: new Error("Supabase is not configured.") }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: async () => ({ error: null }) }),
        insert: async () => ({ error: null }),
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
      }),
      removeChannel: () => {},
    } as any
  : createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);
