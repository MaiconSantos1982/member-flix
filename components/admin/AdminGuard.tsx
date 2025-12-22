'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ShieldX, Loader2 } from 'lucide-react';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
    const hasChecked = useRef(false);

    useEffect(() => {
        // Evitar múltiplas verificações
        if (hasChecked.current) return;

        const checkAdmin = async () => {
            console.log('AdminGuard: Starting check...', { user: !!user, loading });

            // Se ainda está carregando o auth, aguardar
            if (loading) {
                console.log('AdminGuard: Auth still loading...');
                return;
            }

            // Se não tem usuário logado, redirecionar
            if (!user) {
                console.log('AdminGuard: No user, redirecting to login');
                hasChecked.current = true;
                router.push('/login');
                return;
            }

            // Usuário existe, verificar role diretamente no banco
            console.log('AdminGuard: User found, checking role in database for:', user.id);
            hasChecked.current = true;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                console.log('AdminGuard: Profile query result:', { data, error });

                if (error) {
                    // Profile não existe, tentar criar
                    console.log('AdminGuard: Profile not found, creating...');
                    await supabase.from('profiles').insert({
                        id: user.id,
                        email: user.email || '',
                        full_name: user.user_metadata?.full_name || '',
                        role: 'student',
                    });
                    setStatus('unauthorized');
                    setTimeout(() => router.push('/'), 2000);
                    return;
                }

                if (data?.role === 'admin') {
                    console.log('AdminGuard: User is ADMIN! Granting access.');
                    setStatus('authorized');
                } else {
                    console.log('AdminGuard: User role is:', data?.role, '- Access denied');
                    setStatus('unauthorized');
                    setTimeout(() => router.push('/'), 2000);
                }
            } catch (err) {
                console.error('AdminGuard: Error checking admin:', err);
                setStatus('unauthorized');
                setTimeout(() => router.push('/'), 2000);
            }
        };

        checkAdmin();
    }, [user, loading, router]);

    // Loading
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-netflix-red animate-spin" />
                    <p className="text-netflix-text-muted">Verificando permissões...</p>
                    <p className="text-xs text-netflix-text-muted mt-2">
                        {loading ? 'Carregando sessão...' : 'Verificando perfil no banco...'}
                    </p>
                </div>
            </div>
        );
    }

    // Não autorizado
    if (status === 'unauthorized') {
        return (
            <div className="min-h-screen bg-netflix-dark flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldX className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">
                        Acesso Restrito
                    </h1>
                    <p className="text-netflix-text-muted mb-4">
                        Você não tem permissão para acessar o painel administrativo.
                    </p>
                    <p className="text-sm text-netflix-text-muted">
                        Redirecionando para a página inicial...
                    </p>
                </div>
            </div>
        );
    }

    // Autorizado
    return <>{children}</>;
}
