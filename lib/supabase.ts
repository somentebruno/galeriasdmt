import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config Check:');
console.log('- URL:', supabaseUrl ? supabaseUrl : 'MISSING');
console.log('- Key:', supabaseAnonKey ? 'PRESENT (Starts with ' + supabaseAnonKey.substring(0, 5) + '...)' : 'MISSING');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
