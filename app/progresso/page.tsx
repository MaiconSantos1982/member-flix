'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Sidebar } from '@/components/layout/Sidebar';
import { calculateProgress } from '@/lib/utils';
import {
    Trophy,
    Target,
    Flame,
    Star,
    Award,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react';

// Função para calcular dias consecutivos (streak)
function calculateStreak(activities: any[]): number {
    if (!activities || activities.length === 0) return 0;

    // Ordenar por data (mais recente primeiro)
    const sortedActivities = [...activities].sort((a, b) =>
        new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime()
    );

    // Pegar datas únicas (apenas o dia, sem hora)
    const uniqueDates = new Set<string>();
    sortedActivities.forEach(activity => {
        const date = new Date(activity.last_watched_at);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        uniqueDates.add(dateStr);
    });

    const dates = Array.from(uniqueDates).sort().reverse(); // Mais recente primeiro
    if (dates.length === 0) return 0;

    // Verificar se estudou hoje ou ontem
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Se não estudou hoje nem ontem, streak = 0
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
        return 0;
    }

    // Contar dias consecutivos
    let streak = 1;
    let currentDate = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];

        if (dates[i] === prevDateStr) {
            streak++;
            currentDate = new Date(dates[i]);
        } else {
            break; // Quebrou a sequência
        }
    }

    return streak;
}

interface ProgressStats {
    totalCourses: number;
    completedCourses: number;
    totalLessons: number;
    completedLessons: number;
    currentStreak: number;
    totalHoursWatched: number;
}

export default function ProgressoPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<ProgressStats>({
        totalCourses: 0,
        completedCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        currentStreak: 0,
        totalHoursWatched: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchProgressData();
        }
    }, [user, authLoading, router]);

    const fetchProgressData = async () => {
        try {
            setLoading(true);

            console.log('🔍 Iniciando busca de progresso...');

            // Buscar matrículas
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('product_id')
                .eq('user_id', user!.id)
                .eq('active', true);

            console.log('📚 Matrículas encontradas:', enrollments?.length);

            const totalCourses = enrollments?.length || 0;

            // Buscar progresso de aulas
            const { data: progress, count: completedLessonsCount } = await supabase
                .from('lesson_progress')
                .select('*', { count: 'exact' })
                .eq('user_id', user!.id)
                .eq('completed', true);

            const completedLessons = completedLessonsCount || 0;

            console.log('✅ Progresso encontrado:', {
                registros: progress?.length,
                count: completedLessonsCount,
                completedLessons
            });

            // Buscar total de aulas dos cursos matriculados
            const productIds = enrollments?.map(e => e.product_id) || [];
            let totalLessons = 0;
            let completedCourses = 0;

            for (const productId of productIds) {
                const { data: modules } = await supabase
                    .from('modules')
                    .select('id')
                    .eq('product_id', productId);

                const moduleIds = modules?.map(m => m.id) || [];

                const { count: lessonCount } = await supabase
                    .from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .in('module_id', moduleIds);

                console.log(`📖 Produto ${productId}: ${lessonCount} aulas`);

                totalLessons += lessonCount || 0;

                // Verificar se curso está completo
                const { data: lessons } = await supabase
                    .from('lessons')
                    .select('id')
                    .in('module_id', moduleIds);

                const lessonIds = lessons?.map(l => l.id) || [];

                const { count: completed } = await supabase
                    .from('lesson_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user!.id)
                    .in('lesson_id', lessonIds)
                    .eq('completed', true);

                console.log(`   ✓ Aulas concluídas neste produto: ${completed}/${lessonCount}`);

                if ((completed || 0) >= (lessonCount || 0) && (lessonCount || 0) > 0) {
                    completedCourses++;
                }
            }

            // Atividade recente
            const { data: recent } = await supabase
                .from('lesson_progress')
                .select(`
          *,
          lessons (
            title,
            modules (
              title,
              products (title)
            )
          )
        `)
                .eq('user_id', user!.id)
                .order('last_watched_at', { ascending: false })
                .limit(5);

            console.log('\ud83d\udcca Totais calculados:', {
                totalCourses,
                completedCourses,
                totalLessons,
                completedLessons
            });

            // Calcular streak real (dias consecutivos)
            const currentStreak = calculateStreak(recent || []);
            const totalHoursWatched = Math.floor((completedLessons || 0) * 0.5); // Estimativa: 30min por aula

            setStats({
                totalCourses,
                completedCourses,
                totalLessons,
                completedLessons: completedLessons || 0,
                currentStreak,
                totalHoursWatched,
            });

            setRecentActivity(recent || []);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const overallProgress = calculateProgress(stats.completedLessons, stats.totalLessons);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="main-content min-h-screen pb-20">
                {/* Header */}
                <header className="px-4 lg:px-8 py-8 pt-16 lg:pt-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        Meu Progresso
                    </h1>
                    <p className="text-netflix-text-muted">
                        Acompanhe sua evolução e conquistas
                    </p>
                </header>

                <div className="px-4 lg:px-8 space-y-8">
                    {/* Overall Progress Card */}
                    <div className="bg-gradient-to-r from-netflix-red/20 to-purple-500/20 rounded-2xl p-6 border border-white/10">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-netflix-gray"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={351.86}
                                        strokeDashoffset={351.86 * (1 - overallProgress / 100)}
                                        className="text-netflix-red transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">{overallProgress}%</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Continue assim, {profile?.full_name?.split(' ')[0] || 'Aluno'}!
                                </h2>
                                <p className="text-netflix-text-muted mb-4">
                                    Você já completou {stats.completedLessons} de {stats.totalLessons} aulas
                                </p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                        <span className="text-white">
                                            {stats.currentStreak} {stats.currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span className="text-white">{stats.totalHoursWatched}h assistidas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-netflix-red/20 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-netflix-red" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
                                    <p className="text-xs text-netflix-text-muted">Cursos Ativos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
                                    <p className="text-xs text-netflix-text-muted">Concluídos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.completedLessons}</p>
                                    <p className="text-xs text-netflix-text-muted">Aulas Completas</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                                    <p className="text-xs text-netflix-text-muted">Progresso Geral</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Conquistas</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Star, label: 'Primeira Aula', unlocked: stats.completedLessons >= 1 },
                                { icon: Flame, label: '7 Dias Seguidos', unlocked: stats.currentStreak >= 7 },
                                { icon: Trophy, label: 'Curso Completo', unlocked: stats.completedCourses >= 1 },
                                { icon: Award, label: 'Mestre', unlocked: stats.completedCourses >= 3 },
                            ].map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl border text-center transition-all ${achievement.unlocked
                                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                                        : 'bg-netflix-dark border-white/5 opacity-50'
                                        }`}
                                >
                                    <achievement.icon
                                        className={`w-8 h-8 mx-auto mb-2 ${achievement.unlocked ? 'text-yellow-500' : 'text-netflix-text-muted'
                                            }`}
                                    />
                                    <p className={`text-sm font-medium ${achievement.unlocked ? 'text-white' : 'text-netflix-text-muted'
                                        }`}>
                                        {achievement.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    {recentActivity.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Atividade Recente</h2>
                            <div className="space-y-3">
                                {recentActivity.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-netflix-dark rounded-xl border border-white/5"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {activity.lessons?.title || 'Aula'}
                                            </p>
                                            <p className="text-xs text-netflix-text-muted truncate">
                                                {activity.lessons?.modules?.products?.title || 'Curso'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-netflix-text-muted">
                                                {new Date(activity.last_watched_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
