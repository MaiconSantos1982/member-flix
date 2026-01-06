'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PlayCircle, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const passwordRequirements = [
        { label: 'Pelo menos 8 caracteres', check: password.length >= 8 },
        { label: 'Uma letra maiúscula', check: /[A-Z]/.test(password) },
        { label: 'Um número', check: /\d/.test(password) },
    ];

    const isPasswordValid = passwordRequirements.every(req => req.check);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('A senha não atende aos requisitos mínimos.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await signUp(email, password, fullName);

            if (error) {
                if (error.message.includes('already registered')) {
                    setError('Este email já está cadastrado. Tente fazer login.');
                } else {
                    setError('Ocorreu um erro ao criar sua conta. Tente novamente.');
                }
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">
                        Conta criada com sucesso!
                    </h1>
                    <p className="text-netflix-text-muted mb-8">
                        Enviamos um email de confirmação para <strong className="text-white">{email}</strong>.
                        Verifique sua caixa de entrada para ativar sua conta.
                    </p>
                    <Link href="/login" className="btn-primary inline-block">
                        Ir para Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 py-12">
            {/* Background Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-netflix-red/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-netflix-red/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-netflix-red rounded-xl flex items-center justify-center">
                            <PlayCircle className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">WeMembers</span>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="glass rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        Crie sua conta
                    </h1>
                    <p className="text-netflix-text-muted text-center mb-8">
                        Comece sua jornada de aprendizado hoje
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-netflix-text mb-2">
                                Nome completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                                <input
                                    type="text"
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                    required
                                    className="input-field !pl-12"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-netflix-text mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="input-field !pl-12"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-netflix-text mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="input-field !pl-12 !pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-netflix-text-muted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password && (
                                <div className="mt-3 space-y-1">
                                    {passwordRequirements.map((req, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.check ? 'bg-green-500' : 'bg-netflix-gray-lighter'
                                                }`}>
                                                {req.check && <CheckCircle className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={req.check ? 'text-green-500' : 'text-netflix-text-muted'}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-netflix-text mb-2">
                                Confirmar senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="input-field !pl-12"
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-400 mt-1">As senhas não coincidem</p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar conta'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-netflix-text-muted mt-6">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="text-netflix-red hover:underline font-medium">
                            Fazer login
                        </Link>
                    </p>
                </div>

                {/* Terms */}
                <p className="text-xs text-netflix-text-muted text-center mt-6">
                    Ao criar uma conta, você concorda com nossos{' '}
                    <Link href="/termos" className="text-netflix-red hover:underline">Termos de Uso</Link>
                    {' '}e{' '}
                    <Link href="/privacidade" className="text-netflix-red hover:underline">Política de Privacidade</Link>
                </p>
            </div>
        </div>
    );
}
