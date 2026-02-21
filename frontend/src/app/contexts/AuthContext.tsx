import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserRole, Profile } from '../../utils/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  // Helper to fetch profile data without setting state
  const getProfileData = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.message && (error.message.includes('AbortError') || error.message.includes('aborted'))) {
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        name: data.full_name || '',
        created_at: data.created_at,
        bot_user_id: data.bot_user_id,
        pairing_code: data.pairing_code,
      } as Profile;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return null;
      }
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('[Auth] Subscribing to auth changes');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Event: ${event}`, { userId: session?.user?.id });

      if (event === 'SIGNED_OUT') {
        setState({ user: null, profile: null, loading: false });
        return;
      }

      if (session?.user) {
        // If it's a critical event, fetch the profile
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          // Only fetch if we don't have a profile, or the user changed, or it's an explicit USER_UPDATED
          const needsProfileFetch = !state.profile || state.profile.id !== session.user.id || event === 'USER_UPDATED';

          if (needsProfileFetch) {
            setState(prev => ({ ...prev, user: session.user, loading: true }));
            const profile = await getProfileData(session.user.id);
            setState({
              user: session.user,
              profile,
              loading: false
            });
            console.log('[Auth] Profile loaded', { profileId: profile?.id });
          } else {
            // Just update the user object
            setState(prev => ({ ...prev, user: session.user, loading: false }));
          }
        } else {
          // For other events (like TOKEN_REFRESHED), just update the user object
          // but don't re-trigger loading if we already have a profile.
          setState(prev => ({
            ...prev,
            user: session.user,
            loading: prev.profile ? false : prev.loading
          }));
        }
      } else {
        // No session
        setState({ user: null, profile: null, loading: false });
      }
    });

    return () => {
      console.log('[Auth] Unsubscribing');
      subscription.unsubscribe();
    };
  }, [state.profile]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // onAuthStateChange(SIGNED_IN) handles everything else
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado' };
    }
  };

  const signOut = async () => {
    // onAuthStateChange(SIGNED_OUT) clears state
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.profile) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.bot_user_id !== undefined) dbUpdates.bot_user_id = updates.bot_user_id;
    if (updates.pairing_code !== undefined) dbUpdates.pairing_code = updates.pairing_code;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', state.profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    setState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, updateProfile }}>
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