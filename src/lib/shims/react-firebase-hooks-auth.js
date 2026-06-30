import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function useAuthState(auth) {
  const [user, setUser] = useState(auth?.currentUser || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.name || session.user.email,
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.name || session.user.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return [user, loading];
}
