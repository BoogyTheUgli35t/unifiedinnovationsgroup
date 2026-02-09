import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface AuthContextType {
  session: Session | null;
  user: Tables<'profiles'> | null;
  roles: string[];
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Tables<'profiles'> | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      if (initialSession?.user?.id) {
        await loadUserProfile(initialSession.user.id);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession?.user?.id) {
        await loadUserProfile(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRoles([]);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setUser(profile);

      // Load roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;
      
      const roleNames = userRoles?.map(r => r.role) || [];
      setRoles(roleNames);
      setIsAdmin(roleNames.includes('admin') || roleNames.includes('super_admin'));
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        roles,
        isAdmin,
        loading,
        logout,
      }}
    >
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
