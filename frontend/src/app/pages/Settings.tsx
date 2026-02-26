import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Link, CheckCircle, XCircle, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { supabase } from '../../utils/supabase';

const WHATSAPP_BOT_NUMBER = '123456789'; // Reemplaza con tu número de bot real

export function Settings() {
  const { profile, updateProfile, user } = useAuth();
  const [pairingCode, setPairingCode] = useState<string | null>(profile?.pairing_code || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
          // El profile en useAuth debería actualizarse si implementamos el refresco ahí,
          // o podemos forzar una actualización local si es necesario.
          // Por ahora, confiamos en que useAuth lo maneje o refrescamos manualmente si es necesario.
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
    try {
      await updateProfile({ pairing_code: code });
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
      const message = `CONECTAR ${pairingCode}`;
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
    updateProfile({ bot_user_id: null, pairing_code: null });
    setPairingCode(null);
    toast.success('WhatsApp desvinculado correctamente');
  };

  const isConnected = profile?.bot_user_id;

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
                    2. El mensaje debe ser: <code>CONECTAR {pairingCode}</code>
                    <br />
                    3. Una vez enviado, esta pantalla se actualizará automáticamente.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setPairingCode(null);
                    updateProfile({ pairing_code: null });
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
      <Card>
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
    </div>
  );
}