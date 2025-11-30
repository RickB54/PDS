// src/lib/supabase.ts
// Runtime compatibility stub: when VITE_AUTH_MODE=local this stub prevents network calls.
// Keep this file in place. It MUST NOT throw. It should return harmless results.

const MODE = (import.meta.env.VITE_AUTH_MODE || 'local').toLowerCase();

if (MODE === 'supabase') {
  // If you later re-enable Supabase, restore the original client here.
  // For now, we intentionally do not initialize a real client in this branch.
  // (This prevents accidental network usage in local dev.)
}

// Minimal supabase-like stubs used by the app.
// Extend if you find additional methods the app calls.
export const supabase = {
  auth: {
    getUser: async () => ({ data: null, error: null }),
    getSession: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: { message: 'supabase-disabled' } }),
    signUp: async () => ({ data: null, error: { message: 'supabase-disabled' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    updateUser: async () => ({ data: null, error: null }),
  },
  from: (/*table:string*/) => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: [], error: null }),
    upsert: async () => ({ data: [], error: null }),
    update: async () => ({ data: [], error: null }),
    delete: async () => ({ data: [], error: null }),
    eq: () => ({
      select: async () => ({ data: [], error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) })
    }),
    match: () => ({ select: async () => ({ data: [], error: null }) }),
  }),
  storage: {
    from: () => ({ upload: async () => ({ error: null }), download: async () => ({ data: null, error: null }) })
  },
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
  rpc: async () => ({ data: null, error: null }),
};

export const isSupabaseConfigured = () => false;

export default supabase;
