'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PlayCircle, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);

            if (error) {
                console.error('Login error:', error);

                // Mensagens específicas baseadas no erro
                if (error.message.includes('Invalid login credentials')) {
                    setError('Email ou senha incorretos. Verifique suas credenciais.');
                } else if (error.message.includes('Email not confirmed')) {
                    setError('Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.');
                } else if (error.message.includes('Too many requests')) {
                    setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
                } else {
                    setError(`Erro: ${error.message}`);
                }
                return;
            }

            router.push('/');
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
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

                {/* Login Card */}
                <div className="glass rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        Bem-vindo de volta!
                    </h1>
                    <p className="text-netflix-text-muted text-center mb-8">
                        Faça login para acessar seus cursos
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link
                                href="/recuperar-senha"
                                className="text-sm text-netflix-text-muted hover:text-netflix-red transition-colors"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center text-netflix-text-muted mt-6">
                        Não tem uma conta?{' '}
                        <Link href="/registro" className="text-netflix-red hover:underline font-medium">
                            Cadastre-se
                        </Link>
                    </p>
                </div>

                {/* Setup Instructions */}
                <div className="mt-6 p-4 rounded-xl bg-netflix-gray border border-white/10">
                    <p className="text-sm text-yellow-500 text-center mb-2">
                        ⚠️ <strong>Primeiro Acesso?</strong>
                    </p>
                    <p className="text-xs text-netflix-text-muted text-center mb-3">
                        Para usar o sistema, você precisa criar um usuário no Supabase.<br />
                        Vá em <strong className="text-white">Authentication → Users → Add User</strong>
                    </p>
                    <p className="text-xs text-netflix-text-muted text-center">
                        Ou use a página de <Link href="/registro" className="text-netflix-red hover:underline">Cadastro</Link> para criar uma conta.
                    </p>
                </div>
            </div>
        </div>
    );
}
