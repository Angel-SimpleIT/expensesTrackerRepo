import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase, UserRole, Profile } from '../../utils/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  // Helper to fetch profile data without setting state
  const getProfileData = async (userId: string, retries = 3): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 is the error for "JSON object requested, multiple (or no) rows returned"
        // This can happen right after signup if the DB trigger hasn't finished creating the profile
        if (error.code === 'PGRST116' && retries > 0) {
          console.warn(`[Auth] Profile not found for ${userId}, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return getProfileData(userId, retries - 1);
        }

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
        home_currency: data.home_currency,
        bot_user_id: data.bot_user_id,
        pairing_code: data.pairing_code,
        pairing_code_expires_at: data.pairing_code_expires_at,
        timezone: data.timezone,
      } as Profile;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return null;
      }
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const profileIdRef = useRef<string | null>(null);

  useEffect(() => {
    profileIdRef.current = state.profile?.id || null;
  }, [state.profile]);

  useEffect(() => {
    let mounted = true;
    console.log('[Auth] Subscribing to auth changes');

    // Ensure we don't get stuck in a loading state if `onAuthStateChange`
    // doesn't fire an event for unauthenticated users.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error || !session) {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Event: ${event}`, { userId: session?.user?.id });

      if (event === 'SIGNED_OUT') {
        setState({ user: null, profile: null, loading: false });
        return;
      }

      const user = session?.user || null;

      if (user) {
        // If we don't have a profile yet (initial load or sign in)
        // OR if the user ID changed
        // OR if it's a profile update event
        const currentProfileId = profileIdRef.current;
        // Only re-fetch profile if: no profile loaded yet, different user logged in, or explicit profile update needed.
        // NOTE: USER_UPDATED fires when password is changed (recovery flow) — we don't re-fetch profile
        // in that case because the profile data (name, currency, etc.) hasn't changed.
        const needsFetch = !currentProfileId || currentProfileId !== user.id;

        if (needsFetch) {
          // Only show global loading on actual user change, not on metadata updates
          const isNewUser = !currentProfileId || currentProfileId !== user.id;
          if (isNewUser) {
            setState(prev => ({ ...prev, user, loading: true }));
          } else {
            setState(prev => ({ ...prev, user }));
          }

          const profile = await getProfileData(user.id);

          if (mounted) {
            setState(prev => ({
              user,
              profile: profile || prev.profile,
              loading: false
            }));

            if (profile) {
              console.log('[Auth] Profile loaded', { profileId: profile.id });
              const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              if (profile.timezone !== browserTimezone) {
                updateProfileInContext(user.id, { timezone: browserTimezone });
              }
            }
          }
        } else {
          // Already have profile, just update user (e.g. token refresh)
          if (mounted) {
            setState(prev => ({ ...prev, user, loading: false }));
          }
        }
      } else {
        // No user session
        if (mounted) {
          setState({ user: null, profile: null, loading: false });
        }
      }
    });

    return () => {
      mounted = false;
      console.log('[Auth] Unsubscribing');
      subscription.unsubscribe();
    };
  }, []);

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado' };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado' };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If session is null, it means email confirmation is required and enabled
      const needsEmailConfirmation = !data.session;
      return { success: true, needsEmailConfirmation };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado al registrarse' };
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
    if (updates.pairing_code_expires_at !== undefined) dbUpdates.pairing_code_expires_at = updates.pairing_code_expires_at;
    if (updates.home_currency !== undefined) dbUpdates.home_currency = updates.home_currency;

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

  const updateProfileInContext = async (userId: string, updates: Partial<Profile>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.bot_user_id !== undefined) dbUpdates.bot_user_id = updates.bot_user_id;
    if (updates.pairing_code !== undefined) dbUpdates.pairing_code = updates.pairing_code;
    if (updates.pairing_code_expires_at !== undefined) dbUpdates.pairing_code_expires_at = updates.pairing_code_expires_at;
    if (updates.home_currency !== undefined) dbUpdates.home_currency = updates.home_currency;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

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
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, updateProfile, resetPassword, updatePassword }}>
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