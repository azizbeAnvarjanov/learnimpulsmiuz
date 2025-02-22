import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uetyhxypnwjyronmbmcx.supabase.co"; // Supabase URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVldHloeHlwbndqeXJvbm1ibWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzY3OTMsImV4cCI6MjA1NTcxMjc5M30.hoiFwYVNgmKKDZu6Kgfriy0l33z1pu3odSl7gfJFFHI"; // Supabase dan olingan API key

export const supabase = createClient(supabaseUrl, supabaseKey);
