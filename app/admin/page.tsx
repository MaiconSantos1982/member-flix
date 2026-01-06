'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import {
    Users,
    BookOpen,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    Clock,
    PlayCircle
} from 'lucide-react';

interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalEnrollments: number;
    totalRevenue: number;
    activeUsers: number;
    completedLessons: number;
}

interface RecentUser {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
}

interface RecentEnrollment {
    id: string;
    enrolled_at: string;
    profiles: { full_name: string; email: string };
    products: { title: string };
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalProducts: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        activeUsers: 0,
        completedLessons: 0,
    });
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Contagem de usuários
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Contagem de produtos
            const { count: productsCount } = await supabase
                .from('wemembers_products')
                .select('*', { count: 'exact', head: true });

            // Contagem de matrículas
            const { count: enrollmentsCount } = await supabase
                .from('wemembers_enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('active', true);

            // Receita total
            const { data: enrollments } = await supabase
                .from('wemembers_enrollments')
                .select('products(price)')
                .eq('active', true);

            const totalRevenue = enrollments?.reduce((acc: number, e: any) =>
                acc + (e.products?.price || 0), 0) || 0;

            // Aulas completadas
            const { count: completedLessons } = await supabase
                .from('wemembers_lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('completed', true);

            // Usuários recentes
            const { data: users } = await supabase
                .from('profiles')
                .select('id, full_name, email, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            // Matrículas recentes
            const { data: recentEnroll } = await supabase
                .from('wemembers_enrollments')
                .select(`
          id,
          enrolled_at,
          profiles(full_name, email),
          products(title)
        `)
                .order('enrolled_at', { ascending: false })
                .limit(5);

            setStats({
                totalUsers: usersCount || 0,
                totalProducts: productsCount || 0,
                totalEnrollments: enrollmentsCount || 0,
                totalRevenue,
                activeUsers: usersCount || 0,
                completedLessons: completedLessons || 0,
            });

            setRecentUsers(users || []);
            setRecentEnrollments(recentEnroll as any || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, trend, trendUp, color }: any) => (
        <div className="bg-netflix-dark rounded-xl p-6 border border-white/5">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-white mt-4">{value}</p>
            <p className="text-sm text-netflix-text-muted mt-1">{label}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Visão Geral</h1>
                <p className="text-netflix-text-muted mt-1">
                    Acompanhe as métricas do seu negócio
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={Users}
                    label="Total de Alunos"
                    value={stats.totalUsers}
                    trend="+12%"
                    trendUp={true}
                    color="bg-blue-500/20 text-blue-400"
                />
                <StatCard
                    icon={BookOpen}
                    label="Produtos"
                    value={stats.totalProducts}
                    color="bg-purple-500/20 text-purple-400"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Matrículas"
                    value={stats.totalEnrollments}
                    trend="+8%"
                    trendUp={true}
                    color="bg-green-500/20 text-green-400"
                />
                <StatCard
                    icon={DollarSign}
                    label="Receita Total"
                    value={formatCurrency(stats.totalRevenue)}
                    trend="+23%"
                    trendUp={true}
                    color="bg-yellow-500/20 text-yellow-400"
                />
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-netflix-dark rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Alunos Recentes</h2>
                        <Users className="w-5 h-5 text-netflix-text-muted" />
                    </div>

                    <div className="space-y-4">
                        {recentUsers.length > 0 ? (
                            recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-netflix-gray flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-medium text-white">
                                            {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {user.full_name || 'Sem nome'}
                                        </p>
                                        <p className="text-xs text-netflix-text-muted truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-netflix-text-muted">
                                        <Clock className="w-3 h-3" />
                                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-netflix-text-muted text-sm">Nenhum aluno cadastrado</p>
                        )}
                    </div>
                </div>

                {/* Recent Enrollments */}
                <div className="bg-netflix-dark rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Matrículas Recentes</h2>
                        <PlayCircle className="w-5 h-5 text-netflix-text-muted" />
                    </div>

                    <div className="space-y-4">
                        {recentEnrollments.length > 0 ? (
                            recentEnrollments.map((enrollment) => (
                                <div key={enrollment.id} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {(enrollment.profiles as any)?.full_name || 'Aluno'}
                                        </p>
                                        <p className="text-xs text-netflix-text-muted truncate">
                                            {(enrollment.products as any)?.title || 'Curso'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-netflix-text-muted">
                                        <Clock className="w-3 h-3" />
                                        {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-netflix-text-muted text-sm">Nenhuma matrícula ainda</p>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-2 bg-netflix-dark rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Estatísticas Rápidas</h2>
                        <BarChart3 className="w-5 h-5 text-netflix-text-muted" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-netflix-gray rounded-lg">
                            <p className="text-2xl font-bold text-white">{stats.completedLessons}</p>
                            <p className="text-xs text-netflix-text-muted mt-1">Aulas Completadas</p>
                        </div>
                        <div className="text-center p-4 bg-netflix-gray rounded-lg">
                            <p className="text-2xl font-bold text-white">
                                {stats.totalEnrollments > 0
                                    ? Math.round((stats.completedLessons / stats.totalEnrollments) * 100)
                                    : 0}%
                            </p>
                            <p className="text-xs text-netflix-text-muted mt-1">Taxa de Conclusão</p>
                        </div>
                        <div className="text-center p-4 bg-netflix-gray rounded-lg">
                            <p className="text-2xl font-bold text-white">
                                {stats.totalEnrollments > 0
                                    ? formatCurrency(stats.totalRevenue / stats.totalEnrollments)
                                    : formatCurrency(0)}
                            </p>
                            <p className="text-xs text-netflix-text-muted mt-1">Ticket Médio</p>
                        </div>
                        <div className="text-center p-4 bg-netflix-gray rounded-lg">
                            <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                            <p className="text-xs text-netflix-text-muted mt-1">Usuários Ativos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
