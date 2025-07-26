import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://vcxblfbdrqovjeftbtsi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjeGJsZmJkcnFvdmplZnRidHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDUxNDIsImV4cCI6MjA2ODYyMTE0Mn0.YZ4XT0i_pu_fL50ZHs7Cj5scCDr64P0NWBO2UbHaIZ0';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);
