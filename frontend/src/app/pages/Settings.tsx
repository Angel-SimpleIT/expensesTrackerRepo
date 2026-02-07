import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Link, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const WHATSAPP_BOT_NUMBER = '123456789'; // Reemplaza con tu número de bot real

export function Settings() {
  const { profile, updateProfile } = useAuth();
  const [pairingCode, setPairingCode] = useState<string | null>(profile?.pairing_code || null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generar código de 6 dígitos
  const generatePairingCode = async () => {
    setIsGenerating(true);
    
    // Simular llamada al backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCode(code);
    
    // Actualizar el perfil (en producción esto se guardaría en el backend)
    updateProfile({ pairing_code: code });
    
    toast.success('Código de conexión generado');
    setIsGenerating(false);
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#09090b]">Configuración</h1>
        <p className="text-[#6B7280] mt-2">Administra tus preferencias y conexiones</p>
      </div>

      {/* Conectar Canales Section - Solo para usuarios, no para admins */}
      {profile?.role === 'user' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6 transition-shadow hover:shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#4F46E5] bg-opacity-10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#09090b]">Conectar Canales</h2>
              <p className="text-sm text-[#6B7280]">Vincula tu cuenta con WhatsApp</p>
            </div>
          </div>

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

              <button
                onClick={generatePairingCode}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Link className="w-4 h-4" />
                {isGenerating ? 'Generando...' : 'Generar Código de Conexión'}
              </button>
            </div>
          )}

          {/* Código Generado - Esperando Vinculación */}
          {!isConnected && pairingCode && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-[#4F46E5]/5 to-[#818CF8]/5 rounded-xl border border-[#4F46E5]/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-[#09090b]">Tu código de conexión</p>
                  <div className="px-3 py-1 bg-[#FEF3C7] text-[#92400E] text-xs font-medium rounded-full">
                    Pendiente
                  </div>
                </div>

                {/* Código Grande y Elegante */}
                <div className="bg-white rounded-xl p-6 mb-4 border-2 border-dashed border-[#4F46E5]/30">
                  <div className="text-center">
                    <p className="text-xs text-[#6B7280] mb-2 uppercase tracking-wide">Código</p>
                    <p className="text-5xl font-bold text-[#4F46E5] tracking-wider font-mono">
                      {pairingCode}
                    </p>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={copyCode}
                    className="py-3 px-4 bg-white border border-[#E5E7EB] text-[#09090b] rounded-lg font-medium hover:bg-[#F9FAFB] transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                  <button
                    onClick={openWhatsApp}
                    className="py-3 px-4 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir WhatsApp
                  </button>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg p-4">
                <p className="text-sm text-[#0C4A6E] leading-relaxed">
                  <strong>Pasos para conectar:</strong>
                  <br />
                  1. Haz clic en "Abrir WhatsApp"
                  <br />
                  2. Envía el mensaje automático al bot
                  <br />
                  3. El bot confirmará tu conexión
                </p>
              </div>

              {/* Botón de prueba - Solo para desarrollo */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={simulateConnection}
                  className="w-full py-2 text-xs text-[#6B7280] hover:text-[#4F46E5] transition-colors"
                >
                  🔧 Simular conexión (modo desarrollo)
                </button>
              </div>

              <button
                onClick={() => {
                  setPairingCode(null);
                  updateProfile({ pairing_code: null });
                }}
                className="w-full py-2 text-sm text-[#6B7280] hover:text-[#09090b] transition-colors"
              >
                Cancelar
              </button>
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
                <div className="px-3 py-1 bg-[#10B981] text-white text-xs font-medium rounded-full">
                  Activo
                </div>
              </div>

              <button
                onClick={unlinkWhatsApp}
                className="w-full py-3 px-4 bg-white border border-[#FCA5A5] text-[#DC2626] rounded-lg font-medium hover:bg-[#FEF2F2] transition-all"
              >
                Desvincular WhatsApp
              </button>
            </div>
          )}
        </div>
      )}

      {/* Información de Cuenta */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[#09090b] mb-4">Información de Cuenta</h3>
        
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
            <p className="text-sm font-medium text-[#09090b] mt-1">
              {profile?.role === 'user' ? 'Personal (B2C)' : 'Administrador (B2B)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}