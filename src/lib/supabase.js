import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://emthszcfmmndjmpainag.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdGhzemNmbW1uZGptcGFpbmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjgwNDksImV4cCI6MjA5ODM0NDA0OX0.ZnNBjTmd8KFmQHZHUouD6WoB8LWLyXZOZL2-irPwifc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
