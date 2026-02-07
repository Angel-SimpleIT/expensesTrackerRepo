import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserRole, Profile } from '../../utils/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for testing (simulated backend)
const MOCK_USERS = {
  'santi@test.com': {
    id: 'user-santi-123',
    email: 'santi@test.com',
    password: 'santi123',
    role: 'user' as UserRole,
    name: 'Santi',
  },
  'carla@test.com': {
    id: 'user-carla-456',
    email: 'carla@test.com',
    password: 'carla123',
    role: 'admin_b2b' as UserRole,
    name: 'Carla',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage (mock implementation)
    const savedSession = localStorage.getItem('smartspend_session');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        const mockUser = MOCK_USERS[sessionData.email as keyof typeof MOCK_USERS];
        if (mockUser) {
          setUser({ id: mockUser.id, email: mockUser.email } as User);
          
          // Load profile data from localStorage
          const savedProfile = localStorage.getItem(`smartspend_profile_${mockUser.id}`);
          const profileData = savedProfile ? JSON.parse(savedProfile) : {};
          
          setProfile({
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
            name: mockUser.name,
            created_at: new Date().toISOString(),
            bot_user_id: profileData.bot_user_id || null,
            pairing_code: profileData.pairing_code || null,
          });
        }
      } catch (error) {
        localStorage.removeItem('smartspend_session');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    // Mock authentication logic
    const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
    
    if (!mockUser) {
      setLoading(false);
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (mockUser.password !== password) {
      setLoading(false);
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Successful login
    const sessionData = {
      email: mockUser.email,
      id: mockUser.id,
    };

    localStorage.setItem('smartspend_session', JSON.stringify(sessionData));

    setUser({ id: mockUser.id, email: mockUser.email } as User);
    setProfile({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      name: mockUser.name,
      created_at: new Date().toISOString(),
    });

    setLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    localStorage.removeItem('smartspend_session');
    setUser(null);
    setProfile(null);
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      // Save to localStorage (simulate backend persistence)
      localStorage.setItem(`smartspend_profile_${profile.id}`, JSON.stringify({
        bot_user_id: updatedProfile.bot_user_id,
        pairing_code: updatedProfile.pairing_code,
      }));
    }
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