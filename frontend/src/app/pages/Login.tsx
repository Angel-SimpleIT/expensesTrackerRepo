import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Toaster position="top-center" richColors />
      
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4F46E5] rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-[#09090b] mb-2">SmartSpend</h1>
          <p className="text-base text-[#6B7280]">Inicia sesión para continuar</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#09090b] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#09090b] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#09090b] mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#09090b] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl">
              <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
              <p className="text-sm text-[#DC2626]">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4F46E5] text-white font-semibold rounded-xl hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Test Credentials */}
        <div className="mt-10 p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
          <p className="text-sm font-semibold text-[#09090b] mb-3">Credenciales de prueba:</p>
          <div className="space-y-2 text-sm text-[#6B7280]">
            <div className="flex items-center justify-between p-2 bg-white rounded-lg">
              <div>
                <p className="font-medium text-[#09090b]">Usuario Personal</p>
                <p className="text-xs">santi@test.com / santi123</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('santi@test.com');
                  setPassword('santi123');
                }}
                className="text-xs px-3 py-1 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Usar
              </button>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-lg">
              <div>
                <p className="font-medium text-[#09090b]">Admin B2B</p>
                <p className="text-xs">carla@test.com / carla123</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('carla@test.com');
                  setPassword('carla123');
                }}
                className="text-xs px-3 py-1 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Usar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
