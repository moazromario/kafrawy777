import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qbplkookkahsbqoflafy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicGxrb29ra2Foc2Jxb2ZsYWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTQ3NjIsImV4cCI6MjA5MDIzMDc2Mn0.docRw9nhwMSfw7Ol4T06pQAsRahWbqXLECJ0Bv0Uemw';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const instance = getSupabase();
    if (!instance) {
      // Return a dummy object that throws a more descriptive error when called
      return (...args: any[]) => {
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      };
    }
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});
