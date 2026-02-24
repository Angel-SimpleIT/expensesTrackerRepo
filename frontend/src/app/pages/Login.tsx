import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';


export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      toast.success('¡Bienvenido!', {
        description: 'Inicio de sesión exitoso',
        duration: 2000,
      });

      // Redirect to dashboard. ProtectedRoute will show spinner while profile is loading.
      navigate('/dashboard');
    } else {
      setError(result.error || 'Error al iniciar sesión');
      toast.error('Error de autenticación', {
        description: result.error || 'Por favor verifica tus credenciales',
        duration: 4000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center px-4">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-[400px]">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-[#111827] tracking-tighter mb-3">SmartSpend</h1>
          <p className="text-xl text-[#6B7280] font-medium tracking-tight">Tu asistente financiero inteligente</p>
        </div>

        <Card className="border-none shadow-[var(--shadow-card)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bienvenido de nuevo</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-[var(--error-bg)]/10 border border-[var(--error-bg)] rounded-md text-[var(--error-text)] text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                variant="primary"
              >
                Entrar
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center space-y-2 flex flex-col items-center">
                <button
                  type="button"
                  className="text-sm text-[var(--primary-main)] hover:text-[var(--primary-dark)] font-medium transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="text-sm text-[var(--neutral-600)]">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-[var(--primary-main)] hover:text-[var(--primary-dark)] font-medium transition-colors hover:underline"
                  >
                    Regístrate
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <p className="text-sm text-[#6B7280] font-medium text-center">
            Un producto diseñado y desarrollado por
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tighter text-[#111827]">Simple</span>
            <span className="text-xl font-light tracking-tighter text-[#025864]">IT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
