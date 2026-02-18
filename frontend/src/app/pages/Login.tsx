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

      // Redirect based on role (will be determined in the router)
      // The ProtectedRoute component will handle the actual redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--primary-main)] rounded-2xl mb-4 shadow-lg shadow-[var(--primary-main)]/20">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-[var(--font-h1-size)] font-bold text-[var(--neutral-900)] mb-2">SmartSpend</h1>
          <p className="text-[var(--font-body-size)] text-[var(--neutral-500)]">Inicia sesión para continuar</p>
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
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-[var(--primary-main)] hover:text-[var(--primary-dark)] font-medium transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <div className="mt-8">
          <Card variant="outline" className="bg-[var(--neutral-50)]">
            <CardContent className="pt-6">
              <p className="text-sm font-semibold text-[var(--neutral-900)] mb-3">Credenciales de prueba:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[var(--neutral-200)]">
                  <div>
                    <p className="font-medium text-[var(--neutral-900)] text-sm">Usuario Personal</p>
                    <p className="text-xs text-[var(--neutral-500)]">santi@test.com / santi123</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setEmail('santi@test.com');
                      setPassword('santi123');
                    }}
                  >
                    Usar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[var(--neutral-200)]">
                  <div>
                    <p className="font-medium text-[var(--neutral-900)] text-sm">Admin B2B</p>
                    <p className="text-xs text-[var(--neutral-500)]">carla@test.com / carla123</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setEmail('carla@test.com');
                      setPassword('carla123');
                    }}
                  >
                    Usar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
