import { createClient } from '@supabase/supabase-js'

// App público: sem login. Todo acesso ao banco passa por server actions
// com a service role (mesmo padrão do sistema Cavalieri, mesmo Supabase).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
