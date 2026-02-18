import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserRole, Profile } from '../../utils/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from database
  // Fetch profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Ignore AbortError
        if (error.message && (error.message.includes('AbortError') || error.message.includes('aborted'))) {
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      const profileData = {
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        name: data.full_name || '',
        created_at: data.created_at,
        bot_user_id: data.bot_user_id,
        pairing_code: data.pairing_code,
      } as Profile;

      setProfile(profileData);
      return profileData;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return null;
      }
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('AbortError') || error.message?.includes('aborted')) {
          return;
        }
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Fetch profile but don't set loading=true unless there's no profile yet
          // This prevents "stuck" screens if only a partial update happened
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }

      // Ensure loading is false after any auth change event handles initially
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Error inesperado' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.bot_user_id !== undefined) dbUpdates.bot_user_id = updates.bot_user_id;
    if (updates.pairing_code !== undefined) dbUpdates.pairing_code = updates.pairing_code;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    setProfile({ ...profile, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, updateProfile }}>
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