import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

export type { Database }

/**
 * Creates a strongly typed Supabase client.
 * @param supabaseUrl - The URL of your Supabase project
 * @param supabaseKey - The anonymous or service role key
 * @returns A typed Supabase client instance
 */
export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  return createClient<Database>(supabaseUrl, supabaseKey)
}
