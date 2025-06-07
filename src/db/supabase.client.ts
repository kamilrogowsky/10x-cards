import { createClient } from '@supabase/supabase-js';

import type { Database } from '../db/database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export the type for use in other files
export type SupabaseClient = typeof supabaseClient; 

export const DEFAULT_USER_ID = "9954f0ed-573c-4218-b940-c7f852ff58ab"