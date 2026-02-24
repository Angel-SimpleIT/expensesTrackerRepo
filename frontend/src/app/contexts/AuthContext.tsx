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

      if (session?.user) {
        // If it's a critical event, fetch the profile
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          // Check against the ref to avoid dependency cycles
          const currentProfileId = profileIdRef.current;
          const needsProfileFetch = !currentProfileId || currentProfileId !== session.user.id || event === 'USER_UPDATED';

          if (needsProfileFetch) {
            setState(prev => ({ ...prev, user: session.user, loading: true }));
            const profile = await getProfileData(session.user.id);
            if (!mounted) return;
            setState({
              user: session.user,
              profile,
              loading: false
            });
            console.log('[Auth] Profile loaded', { profileId: profile?.id });

            // Detect and auto-update timezone
            if (profile) {
              const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              if (profile.timezone !== browserTimezone) {
                console.log(`[Auth] Timezone mismatch: ${profile.timezone} vs ${browserTimezone}. Updating...`);
                // Update in DB and background update state
                updateProfileInContext(session.user.id, { timezone: browserTimezone });
              }
            }
          } else {
            // Just update the user object
            if (!mounted) return;
            setState(prev => ({ ...prev, user: session.user, loading: false }));
          }
        } else {
          // For other events (like TOKEN_REFRESHED), just update the user object
          // but don't re-trigger loading if we already have a profile.
          if (!mounted) return;
          setState(prev => ({
            ...prev,
            user: session.user,
            loading: prev.profile ? false : prev.loading
          }));
        }
      } else {
        // No session
        if (!mounted) return;
        setState({ user: null, profile: null, loading: false });
      }
    });

    return () => {
      mounted = false;
      console.log('[Auth] Unsubscribing');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Fallback: If onAuthStateChange doesn't fire (e.g., already signed in but profile fetch previously failed)
      if (data.session && (!state.profile || state.user?.id !== data.session.user.id)) {
        setState(prev => ({ ...prev, user: data.session.user, loading: true }));
        const profile = await getProfileData(data.session.user.id);
        setState({
          user: data.session.user,
          profile,
          loading: false
        });
      }

      // onAuthStateChange(SIGNED_IN) handles everything else
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
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, updateProfile }}>
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