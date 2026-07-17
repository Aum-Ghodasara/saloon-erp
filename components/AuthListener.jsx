"use client";

import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/db";

export default function AuthListener() {
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            // Retrieve profile
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            let name = session.user.user_metadata?.full_name || session.user.email;
            let role = "customer";

            if (profile) {
              name = profile.name || name;
              role = profile.role || role;
            } else {
              // Create default profile for OAuth/New SignUp user
              await supabase.from('profiles').insert({
                id: session.user.id,
                email: session.user.email,
                name: name,
                role: role
              });
            }

            // Sync credentials to localStorage so existing frontend continues working
            localStorage.setItem("bsmart_role", role);
            localStorage.setItem("bsmart_user", name);
            localStorage.setItem("bsmart_user_id", session.user.id);
            
            // Dispatch dynamic event so active components can refresh
            window.dispatchEvent(new Event("bsmart_auth_changed"));
          } catch (err) {
            console.error("AuthListener profile sync failed:", err);
          }
        } else {
          // If signed out of Supabase, check if we had a synced session
          const userId = localStorage.getItem("bsmart_user_id");
          if (userId) {
            localStorage.removeItem("bsmart_role");
            localStorage.removeItem("bsmart_user");
            localStorage.removeItem("bsmart_user_id");
            window.dispatchEvent(new Event("bsmart_auth_changed"));
          }
        }
      });

      return () => subscription?.unsubscribe();
    }
  }, []);

  return null;
}
