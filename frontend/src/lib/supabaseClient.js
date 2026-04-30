// Supabase client (singleton). Used directly from the browser.
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Surface a clear error early during dev.
  // eslint-disable-next-line no-console
  console.error('[ContiBracket] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url || '', key || '', {
  auth: {
    persistSession: false,        // we don't use Supabase Auth for players
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
