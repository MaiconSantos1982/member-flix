'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, ProductWithAccess } from '@/lib/supabase';
import { Sidebar } from '@/components/layout/Sidebar';
import { CourseCard, CourseCardSkeleton } from '@/components/ui/CourseCard';
import { calculateProgress } from '@/lib/utils';
import { BookOpen, Trophy, Clock, Play } from 'lucide-react';

export default function MeusursosPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [enrolledProducts, setEnrolledProducts] = useState<(ProductWithAccess & {
        lessonsCompleted: number;
        totalLessons: number;
    })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchEnrolledProducts();
        }
    }, [user, authLoading, router]);

    const fetchEnrolledProducts = async () => {
        try {
            setLoading(true);

            // Buscar matrículas ativas do usuário
            const { data: enrollmentsData, error: enrollmentsError } = await supabase
                .from('enrollments')
                .select(`
          product_id,
          products (*)
        `)
                .eq('user_id', user!.id)
                .eq('active', true);

            if (enrollmentsError) throw enrollmentsError;

            // Para cada produto, calcular progresso
            const productsWithProgress = await Promise.all(
                (enrollmentsData || []).map(async (enrollment: any) => {
                    const product = enrollment.products;

                    // Buscar total de aulas do produto
                    const { data: modulesData } = await supabase
                        .from('modules')
                        .select('id')
                        .eq('product_id', product.id);

                    const moduleIds = modulesData?.map(m => m.id) || [];

                    const { count: totalLessons } = await supabase
                        .from('lessons')
                        .select('*', { count: 'exact', head: true })
                        .in('module_id', moduleIds);

                    // Buscar aulas completadas
                    const { data: lessonsData } = await supabase
                        .from('lessons')
                        .select('id')
                        .in('module_id', moduleIds);

                    const lessonIds = lessonsData?.map(l => l.id) || [];

                    const { count: lessonsCompleted } = await supabase
                        .from('lesson_progress')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user!.id)
                        .in('lesson_id', lessonIds)
                        .eq('completed', true);

                    return {
                        ...product,
                        has_access: true,
                        lessonsCompleted: lessonsCompleted || 0,
                        totalLessons: totalLessons || 0,
                    };
                })
            );

            setEnrolledProducts(productsWithProgress);
        } catch (error) {
            console.error('Error fetching enrolled products:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalCourses = enrolledProducts.length;
    const completedCourses = enrolledProducts.filter(
        p => p.lessonsCompleted >= p.totalLessons && p.totalLessons > 0
    ).length;
    const inProgressCourses = totalCourses - completedCourses;

    if (authLoading) {
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
                        Meus Cursos
                    </h1>
                    <p className="text-netflix-text-muted">
                        Continue de onde parou e acompanhe seu progresso
                    </p>
                </header>

                {/* Stats */}
                <div className="px-4 lg:px-8 mb-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{totalCourses}</p>
                                    <p className="text-xs text-netflix-text-muted">Total de Cursos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{inProgressCourses}</p>
                                    <p className="text-xs text-netflix-text-muted">Em Andamento</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{completedCourses}</p>
                                    <p className="text-xs text-netflix-text-muted">Concluídos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-netflix-dark rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-netflix-red/20 flex items-center justify-center">
                                    <Play className="w-5 h-5 text-netflix-red" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {enrolledProducts.reduce((acc, p) => acc + p.lessonsCompleted, 0)}
                                    </p>
                                    <p className="text-xs text-netflix-text-muted">Aulas Completas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="px-4 lg:px-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : enrolledProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledProducts.map((product) => (
                                <div key={product.id} className="relative group">
                                    <CourseCard
                                        product={product}
                                        onClick={() => router.push(`/watch/${product.id}`)}
                                    />
                                    {/* Progress Bar Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent rounded-b-lg">
                                        <div className="progress-bar mb-2">
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${calculateProgress(product.lessonsCompleted, product.totalLessons)}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-netflix-text-muted">
                                            {product.lessonsCompleted} de {product.totalLessons} aulas •
                                            {calculateProgress(product.lessonsCompleted, product.totalLessons)}% concluído
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <BookOpen className="w-16 h-16 text-netflix-text-muted mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Nenhum curso ainda
                            </h2>
                            <p className="text-netflix-text-muted mb-6">
                                Você ainda não está matriculado em nenhum curso.
                            </p>
                            <button
                                onClick={() => router.push('/catalogo')}
                                className="btn-primary"
                            >
                                Explorar Catálogo
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
