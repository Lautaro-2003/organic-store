import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://xxx.supabase.co') {
    return null
  }
  return createClient(supabaseUrl, supabaseKey)
}
