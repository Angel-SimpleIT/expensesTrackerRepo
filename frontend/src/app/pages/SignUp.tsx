import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, AlertCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { TermsAndConditionsModal } from '../components/auth/TermsAndConditionsModal';

export function SignUp() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

        if (!firstName.trim()) {
            setError('Por favor ingresa tu nombre');
            return;
        }

        if (!lastName.trim()) {
            setError('Por favor ingresa tu apellido');
            return;
        }

        if (!termsAccepted) {
            setError('Debes aceptar los Términos y Condiciones para continuar');
            return;
        }

        setLoading(true);

        const result = await signUp(email, password, firstName, lastName);

        if (result.success) {
            if (result.needsEmailConfirmation) {
                setSuccess(true);
                toast.success('¡Registro exitoso!', {
                    description: 'Revisa tu correo para confirmar la cuenta.',
                    duration: 4000,
                });
            } else {
                toast.success('¡Registro exitoso!', {
                    description: 'Redirigiendo al inicio...',
                    duration: 2000,
                });
                navigate('/dashboard');
            }
        } else {
            setError(result.error || 'Error al crear la cuenta');
            toast.error('Error de registro', {
                description: result.error || 'Por favor verifica la información ingresada',
                duration: 4000,
            });
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center px-4">
                <div className="w-full max-w-[400px]">
                    <Card className="border-none shadow-[var(--shadow-card)]">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center">¡Cuenta creada!</CardTitle>
                            <CardDescription className="text-center">
                                Hemos enviado un correo a <span className="font-semibold text-[var(--primary-main)]">{email}</span>.
                                Por favor, verifica tu bandeja de entrada o spam para confirmar tu cuenta y continuar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                Volver al inicio de sesión
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

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
                        <CardTitle className="text-2xl text-center">Crea tu cuenta</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tus datos para registrarte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-4">
                                {/* First Name Field */}
                                <div className="space-y-2 flex-1">
                                    <label htmlFor="firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Nombre
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Tu nombre"
                                            required
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Last Name Field */}
                                <div className="space-y-2 flex-1">
                                    <label htmlFor="lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Apellido
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Tu apellido"
                                            required
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

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

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-[var(--error-bg)]/10 border border-[var(--error-bg)] rounded-md text-[var(--error-text)] text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Terms and Conditions */}
                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox
                                    id="terms"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--neutral-700)] cursor-pointer"
                                    >
                                        Acepto los{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsTermsModalOpen(true);
                                            }}
                                            className="text-[var(--primary-main)] hover:underline font-semibold"
                                        >
                                            Términos y Condiciones
                                        </button>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full"
                                variant="primary"
                            >
                                Registrarte
                            </Button>

                            <div className="text-center mt-4">
                                <p className="text-sm text-[var(--neutral-600)]">
                                    ¿Ya tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="text-[var(--primary-main)] hover:text-[var(--primary-dark)] font-medium transition-colors hover:underline"
                                    >
                                        Inicia sesión
                                    </button>
                                </p>
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

            <TermsAndConditionsModal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
            />
        </div>
    );
}
