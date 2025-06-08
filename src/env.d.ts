/// <reference types="astro/client" />

import type { Database } from './db/database.types.ts';
import type { SupabaseServerClient } from './db/supabase.client.ts';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseServerClient;
      authenticated: boolean;
      user_id?: string;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
