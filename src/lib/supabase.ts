import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjlpduhctdryeawnldfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbHBkdWhjdGRyeWVhd25sZGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Njc5MjEsImV4cCI6MjA2MzQ0MzkyMX0.1s4wKwoE72y8_4VZD9hkYfn_O47ytly-Mq0LWCD-d1U';

export const supabase = createClient(supabaseUrl, supabaseKey);
