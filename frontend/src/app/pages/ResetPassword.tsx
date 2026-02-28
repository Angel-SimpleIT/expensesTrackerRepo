import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { supabase } from '../../utils/supabase';

export function ResetPassword() {
    const navigate = useNavigate();
    const { updatePassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check if we have a session (the reset link should have signed us in)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Sesión no válida', {
                    description: 'El enlace de recuperación ha expirado o no es válido.',
                });
                setTimeout(() => navigate('/forgot-password'), 3000);
            }
        };
        checkSession();
    }, [navigate]);

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

        try {
            const result = await updatePassword(password);

            if (result.success) {
                setSuccess(true);
                toast.success('Contraseña actualizada', {
                    description: 'Tu contraseña ha sido cambiada correctamente',
                });
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.error || 'Error al actualizar la contraseña');
                toast.error('Error', {
                    description: result.error || 'No se pudo actualizar la contraseña',
                });
            }
        } finally {
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
                    <p className="text-xl text-[#6B7280] font-medium tracking-tight">Establecer nueva contraseña</p>
                </div>

                <Card className="border-none shadow-[var(--shadow-card)]">
                    {!success ? (
                        <>
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl text-center">Nueva contraseña</CardTitle>
                                <CardDescription className="text-center">
                                    Ingresa tu nueva contraseña para acceder a tu cuenta
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-sm font-medium leading-none">
                                            Nueva Contraseña
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

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                                            Confirmar Contraseña
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-[var(--error-bg)]/10 border border-[var(--error-bg)] rounded-md text-[var(--error-text)] text-sm">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        isLoading={loading}
                                        className="w-full"
                                        variant="primary"
                                    >
                                        Actualizar contraseña
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="pt-10 pb-8 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[#111827]">¡Éxito!</h2>
                                <p className="text-[#6B7280]">
                                    Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión.
                                </p>
                            </div>
                        </CardContent>
                    )}
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
