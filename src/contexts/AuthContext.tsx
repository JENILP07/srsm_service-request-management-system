"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuthData, signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from '@/app/actions/auth';

export type AppRole = 'admin' | 'hod' | 'technician' | 'requestor';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  department_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: any | null; // Placeholder for session object if needed
  profile: Profile | null;
  role: AppRole;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (requiredRole: AppRole | AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole>('requestor');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await getAuthData();
      setUser(data.user);
      // @ts-ignore
      setProfile(data.profile);
      // @ts-ignore
      setRole(data.role as AppRole);
    } catch (error) {
      console.error('Auth check failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiSignIn(email, password);
      if (res.error) throw new Error(res.error);
      await checkAuth(); // Refresh state
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
        const res = await apiSignUp(email, password, name);
        if (res.error) throw new Error(res.error);
        await checkAuth();
        return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await apiSignOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole('requestor');
    window.location.reload(); // Force reload to clear client state
  };

  const hasRole = (requiredRole: AppRole | AppRole[]) => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      isLoading,
      signIn,
      signUp,
      signOut,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
