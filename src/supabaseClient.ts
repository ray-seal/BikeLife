import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
export const supabase = createClient(supabaseUrl, supabaseKey);
