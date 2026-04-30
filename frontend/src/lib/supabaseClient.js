// Supabase client (singleton). Used directly from the browser.
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabaseConfigOk = !!(url && key && /^https?:\/\//i.test(url));

function makeFakeClient() {
  // Safe no-op client so imports don't crash. Every call rejects with a clear error.
  const err = () =>
    Promise.reject(
      new Error(
        'Supabase not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY and rebuild.'
      )
    );
  const chain = new Proxy(
    {},
    {
      get: () => (...args) => {
        // terminal promise-returning ops
        return { then: (onF, onR) => err().then(onF, onR), catch: (onR) => err().catch(onR) };
      },
    }
  );
  return {
    from: () => chain,
    auth: { getSession: err, signOut: err },
  };
}

export const supabase = supabaseConfigOk
  ? createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : makeFakeClient();

// eslint-disable-next-line no-console
if (!supabaseConfigOk) console.error('[ContiBracket] Missing or invalid Supabase env vars — see MisconfigScreen.');
