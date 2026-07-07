const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE not fully configured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: { persistSession: false }
});

module.exports = supabase;
