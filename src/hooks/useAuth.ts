'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  targetRole: string;
  experienceLevel: string;
  interviewsRemaining: number;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const isLoading = status === 'loading' || profileLoading;
  const isAuthenticated = status === 'authenticated';

  // Fetch full profile when session is available
  useEffect(() => {
    if (isAuthenticated && session?.user?.id && !profile) {
      setProfileLoading(true);
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfile(data);
          }
        })
        .catch(() => {})
        .finally(() => setProfileLoading(false));
    }
    if (!isAuthenticated && status !== 'loading') {
      setProfile(null);
    }
  }, [isAuthenticated, session?.user?.id, status, profile]);

  // Sign up with credentials
  const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    targetRole?: string,
    experienceLevel?: string
  ) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, targetRole, experienceLevel }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) throw new Error(result.error);

    window.location.href = '/dashboard';
  };

  // Sign in with credentials
  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) throw new Error('Invalid email or password');

    window.location.href = '/dashboard';
  };

  // Sign in with Google
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  return {
    user: profile,
    session,
    isLoading,
    isAuthenticated,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    refreshUser: () => {
      setProfile(null);
    },
  };
}
