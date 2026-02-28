import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Link, CheckCircle, XCircle, Copy, ExternalLink, AlertTriangle, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { supabase } from '../../utils/supabase';
import { Input } from '../components/ui/input';
import { ChangeCurrencyModal } from '../components/auth/ChangeCurrencyModal';

const WHATSAPP_BOT_NUMBER = '59894933034'; // Número de bot real

export function Settings() {
  const { profile, updateProfile, user } = useAuth();
  const [pairingCode, setPairingCode] = useState<string | null>(profile?.pairing_code || null);
  const [localIsConnected, setLocalIsConnected] = useState<boolean>(!!profile?.bot_user_id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);

  useEffect(() => {
    setLocalIsConnected(!!profile?.bot_user_id);
    setPairingCode(profile?.pairing_code || null);
  }, [profile?.bot_user_id, profile?.pairing_code]);

  // Suscribirse a cambios en el perfil para actualización en tiempo real (vinculación WhatsApp)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Perfil actualizado en tiempo real:', payload.new);
          // Actualizamos el estado local del código si cambió
          if (payload.new.pairing_code !== undefined) {
            setPairingCode(payload.new.pairing_code);
          }
          if (payload.new.bot_user_id) {
            setLocalIsConnected(prev => {
              if (!prev) toast.success('¡WhatsApp conectado exitosamente!');
              return true;
            });
          } else {
            setLocalIsConnected(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      await supabase.auth.signOut();
      toast.success('Tu cuenta ha sido eliminada correctamente.');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Hubo un error al eliminar tu cuenta. Por favor, contacta a soporte.');
      setIsDeleting(false);
    }
  };

  // Generar código de 6 dígitos
  const generatePairingCode = async () => {
    setIsGenerating(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos en el futuro
    try {
      await updateProfile({ pairing_code: code, pairing_code_expires_at: expiresAt });
      setPairingCode(code);
      toast.success('Código de conexión generado. Envialo por WhatsApp.');
    } catch (error) {
      toast.error('Error al generar el código.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copiar código al portapapeles
  const copyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      toast.success('Código copiado al portapapeles');
    }
  };

  // Abrir WhatsApp con mensaje predefinido
  const openWhatsApp = () => {
    if (pairingCode) {
      const message = pairingCode;
      const url = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  // Simular conexión exitosa (para testing - eliminar en producción)
  const simulateConnection = () => {
    const botUserId = `whatsapp_${Date.now()}`;
    updateProfile({ bot_user_id: botUserId });
    toast.success('¡WhatsApp conectado exitosamente!');
  };

  // Desvincular WhatsApp
  const unlinkWhatsApp = () => {
    updateProfile({ bot_user_id: null, pairing_code: null, pairing_code_expires_at: null });
    setPairingCode(null);
    toast.success('WhatsApp desvinculado correctamente');
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setIsUpdatingCurrency(true);
    try {
      await updateProfile({ home_currency: newCurrency });
      toast.success(`Moneda principal cambiada a ${newCurrency} exitosamente.`);
      setIsCurrencyModalOpen(false);
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error('Hubo un error al cambiar la moneda.');
    } finally {
      setIsUpdatingCurrency(false);
    }
  };

  const isConnected = localIsConnected;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#09090b]">Configuración</h1>
        <p className="text-[#6B7280] mt-2">Administra tus preferencias y conexiones</p>
      </div>

      {/* Conectar Canales Section - Solo para usuarios, no para admins */}
      {profile?.role === 'user' && (
        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#025864] bg-opacity-10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#025864]" />
              </div>
              <div>
                <CardTitle>Conectar Canales</CardTitle>
                <CardDescription>Vincula tu cuenta con WhatsApp</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Estado Desconectado */}
            {!isConnected && !pairingCode && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <XCircle className="w-5 h-5 text-[#6B7280]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#09090b]">WhatsApp</p>
                    <p className="text-xs text-[#6B7280]">No conectado</p>
                  </div>
                </div>

                <Button
                  onClick={generatePairingCode}
                  disabled={isGenerating}
                  className="w-full"
                  isLoading={isGenerating}
                  leftIcon={<Link className="w-4 h-4" />}
                >
                  Generar Código de Conexión
                </Button>
              </div>
            )}

            {/* Código Generado - Esperando Vinculación */}
            {!isConnected && pairingCode && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-[#025864]/5 to-[#00D47E]/5 rounded-xl border border-[#025864]/20">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-[#09090b]">Tu código de conexión</p>
                    <Badge variant="warning">Pendiente</Badge>
                  </div>

                  {/* Código Grande y Elegante */}
                  <div className="bg-white rounded-xl p-6 mb-4 border-2 border-dashed border-[#025864]/30">
                    <div className="text-center">
                      <p className="text-xs text-[#6B7280] mb-2 uppercase tracking-wide">Código</p>
                      <p className="text-5xl font-bold text-[#025864] tracking-wider font-mono">
                        {pairingCode}
                      </p>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={copyCode}
                      leftIcon={<Copy className="w-4 h-4" />}
                    >
                      Copiar
                    </Button>
                    <Button
                      onClick={openWhatsApp}
                      className="bg-[#10B981] hover:bg-[#059669]"
                      leftIcon={<ExternalLink className="w-4 h-4" />}
                    >
                      Abrir WhatsApp
                    </Button>
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg p-4">
                  <p className="text-sm text-[#0C4A6E] leading-relaxed">
                    <strong>Pasos para conectar:</strong>
                    <br />
                    1. Haz clic en <strong>"Abrir WhatsApp"</strong> o enviá manualmente el código.
                    <br />
                    2. El mensaje debe ser: <code>{pairingCode}</code>
                    <br />
                    3. Una vez enviado, esta pantalla se actualizará automáticamente.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setPairingCode(null);
                    updateProfile({ pairing_code: null, pairing_code_expires_at: null });
                  }}
                  className="w-full text-[#6B7280] hover:text-[#09090b]"
                >
                  Cancelar
                </Button>
              </div>
            )}

            {/* Estado Conectado */}
            {isConnected && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#10B981]/10 to-[#34D399]/10 rounded-lg border border-[#10B981]/30">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#09090b]">WhatsApp</p>
                    <p className="text-xs text-[#6B7280]">Conectado correctamente</p>
                  </div>
                  <Badge variant="success">Activo</Badge>
                </div>

                <Button
                  variant="destructive"
                  onClick={unlinkWhatsApp}
                  className="w-full bg-white border border-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-bg)]/10"
                >
                  Desvincular WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información de Cuenta */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Información de Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#6B7280] uppercase tracking-wide">Nombre</label>
              <p className="text-sm font-medium text-[#09090b] mt-1">{profile?.name}</p>
            </div>

            <div>
              <label className="text-xs text-[#6B7280] uppercase tracking-wide">Email</label>
              <p className="text-sm font-medium text-[#09090b] mt-1">{profile?.email}</p>
            </div>

            <div>
              <label className="text-xs text-[#6B7280] uppercase tracking-wide">Tipo de Cuenta</label>
              <div className="mt-1">
                <Badge variant="secondary" className="font-normal">
                  {profile?.role === 'user' ? 'Personal (B2C)' : 'Administrador (B2B)'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad - Cambiar Contraseña */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Seguridad
          </CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Zona de Peligro */}
      <Card className="mt-8 border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones destructivas para tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Cambiar Moneda - Zona de Peligro */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-red-50/50 border border-red-100 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Cambiar moneda principal</p>
              <p className="text-sm text-gray-500 mt-1">
                La moneda actual es <span className="font-bold text-red-700">{profile?.home_currency || 'USD'}</span>.
                Cambiar esto afectará cómo se visualizan los montos y los reportes financieros.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsCurrencyModalOpen(true)}
              className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
              disabled={isUpdatingCurrency}
            >
              Cambiar moneda
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-red-50/50 border border-red-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Eliminar cuenta</p>
              <p className="text-sm text-gray-500 mt-1">
                Esto eliminará permanentemente tu cuenta y todos tus datos después de 30 días. Esta acción no se puede deshacer.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="shrink-0">
                  Eliminar mi cuenta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Tu cuenta será desactivada y tus datos serán eliminados permanentemente después de 30 días.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }} className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600" disabled={isDeleting}>
                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <ChangeCurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        onConfirm={handleCurrencyChange}
        currentCurrency={profile?.home_currency}
        isLoading={isUpdatingCurrency}
      />
    </div>
  );
}

function ChangePasswordForm() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);

    if (result.success) {
      toast.success('Contraseña actualizada correctamente');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Error al actualizar la contraseña');
      toast.error('Error', {
        description: result.error || 'No se pudo actualizar la contraseña',
      });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-[#6B7280] uppercase tracking-wide">Nueva Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#6B7280] uppercase tracking-wide">Confirmar Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--error-bg)]/10 border border-[var(--error-bg)] rounded-md text-[var(--error-text)] text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={loading}
          variant="primary"
        >
          Actualizar Contraseña
        </Button>
      </div>
    </form>
  );
}