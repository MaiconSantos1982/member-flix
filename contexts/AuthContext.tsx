'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);


    const fetchProfile = async (userId: string) => {
        try {
            console.log('fetchProfile: Starting for user:', userId);

            // Timeout de 5 segundos
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout fetching profile')), 5000);
            });

            const fetchPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([
                fetchPromise,
                timeoutPromise
            ]) as any;

            console.log('fetchProfile: Result:', { data: !!data, error: !!error });

            if (error) {
                console.error('fetchProfile: Error:', error);
                return null;
            }

            return data as Profile;
        } catch (err) {
            console.error('fetchProfile: Caught error:', err);
            return null;
        }
    };


    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id);
            setProfile(profileData);
        }
    };

    useEffect(() => {
        console.log('AuthContext: Initializing...');

        // Verificar sessão inicial
        const getInitialSession = async () => {
            console.log('AuthContext: Getting initial session...');
            const { data: { session } } = await supabase.auth.getSession();

            console.log('AuthContext: Initial session:', !!session?.user);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                console.log('AuthContext: Fetching profile for user:', session.user.id);
                const profileData = await fetchProfile(session.user.id);
                console.log('AuthContext: Profile fetched:', profileData);
                setProfile(profileData);
            }

            console.log('AuthContext: Setting loading to FALSE');
            setLoading(false);
        };

        getInitialSession();

        // Listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('AuthContext: Auth state changed:', event, !!session?.user);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profileData = await fetchProfile(session.user.id);
                    console.log('AuthContext: Profile updated:', profileData);
                    setProfile(profileData);
                } else {
                    setProfile(null);
                }

                console.log('AuthContext: Setting loading to FALSE (from listener)');
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        console.log('AuthContext: Starting signIn for', email);

        try {
            // Timeout de 10 segundos
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout: O Supabase não respondeu em 10 segundos. Verifique se o projeto está ativo.')), 10000);
            });

            const signInPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('AuthContext: Calling Supabase...');

            const { data, error } = await Promise.race([
                signInPromise,
                timeoutPromise
            ]) as any;

            console.log('AuthContext: signIn result', { data: !!data?.user, error: !!error });

            if (error) {
                console.error('AuthContext: signIn error', error);
                return { error };
            }

            console.log('AuthContext: Login successful!');
            return { error: null };
        } catch (err: any) {
            console.error('AuthContext: Unexpected error in signIn', err);
            return { error: err as Error };
        }
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (!error && data.user) {
            // Criar perfil
            await supabase.from('profiles').insert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: 'student',
            });
        }

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
