'use client';

import { useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, isLoading, setUser, reset } = useAuthStore();
  const supabase = useMemo(() => createClient(), []);
  const initialized = useRef(false);

  // Fetch the current user's profile
  const fetchUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    targetRole?: string,
    experienceLevel?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw new Error(error.message);

    // Update profile with additional fields
    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          target_role: targetRole || 'Software Engineer',
          experience_level: experienceLevel || 'mid',
        } as never)
        .eq('id', data.user.id);
    }

    // Redirect with full navigation to avoid Supabase auth lock AbortError
    window.location.href = '/dashboard';
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // Redirect with full navigation to avoid Supabase auth lock AbortError
    window.location.href = '/dashboard';
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    reset();
    window.location.href = '/';
  };

  // Initialize auth state once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchUser();
        } else if (event === 'SIGNED_OUT') {
          reset();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    refreshUser: fetchUser,
  };
}
