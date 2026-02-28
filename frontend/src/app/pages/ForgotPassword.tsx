import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export function ForgotPassword() {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await resetPassword(email);

        if (result.success) {
            setSubmitted(true);
            toast.success('Correo enviado', {
                description: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
                duration: 5000,
            });
        } else {
            setError(result.error || 'Error al enviar el correo');
            toast.error('Error', {
                description: result.error || 'No se pudo enviar el correo de recuperación',
                duration: 4000,
            });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center px-4">
            <Toaster position="top-center" richColors />

            <div className="w-full max-w-[400px]">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-[#111827] tracking-tighter mb-3">SmartSpend</h1>
                    <p className="text-xl text-[#6B7280] font-medium tracking-tight">Recuperar contraseña</p>
                </div>

                <Card className="border-none shadow-[var(--shadow-card)]">
                    {!submitted ? (
                        <>
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl text-center">¿Olvidaste tu contraseña?</CardTitle>
                                <CardDescription className="text-center">
                                    Ingresa tu email y te enviaremos un enlace para restablecerla
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium leading-none">
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
                                        Enviar enlace
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="w-full flex items-center justify-center gap-2 text-sm text-[var(--neutral-600)] hover:text-[var(--primary-main)] font-medium transition-colors hover:underline mt-4"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Volver al inicio de sesión
                                    </button>
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
                                <h2 className="text-2xl font-bold text-[#111827]">¡Correo enviado!</h2>
                                <p className="text-[#6B7280]">
                                    Hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full"
                                variant="primary"
                            >
                                Volver al inicio de sesión
                            </Button>
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
