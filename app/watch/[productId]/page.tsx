'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product, Module, Lesson, LessonProgress } from '@/lib/supabase';
import { isModuleUnlocked, getUnlockDate } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { PDFReader } from '@/components/player/PDFReader';
import { LessonsSidebar } from '@/components/player/LessonsSidebar';
import { DynamicBanner } from '@/components/ui/DynamicBanner';
import { BannerPopup } from '@/components/ui/BannerPopup';
import {
    ArrowLeft,
    CheckCircle,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface ModuleWithLessons extends Module {
    lessons: (Lesson & { progress?: LessonProgress })[];
    is_unlocked: boolean;
    unlock_date?: Date;
}

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const productId = params.productId as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [modules, setModules] = useState<ModuleWithLessons[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [enrolledAt, setEnrolledAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingProgress, setSavingProgress] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showBannerPopup, setShowBannerPopup] = useState(false);
    const [globalBanner, setGlobalBanner] = useState<{
        enabled: boolean;
        image_url: string;
        link_url: string;
        alt_text: string;
        show_as_popup: boolean;
    } | null>(null);

    // Verificar acesso e carregar dados
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && productId) {
            checkAccessAndLoadData();
            fetchGlobalBanner();
        }
    }, [user, authLoading, productId, router]);

    const fetchGlobalBanner = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'global_banner')
                .single();

            if (!error && data) {
                const bannerData = data.value as any;
                setGlobalBanner(bannerData);

                // Mostrar popup se habilitado e não foi dispensado
                if (
                    bannerData.enabled &&
                    bannerData.show_as_popup &&
                    bannerData.image_url &&
                    !localStorage.getItem('banner_popup_dismissed')
                ) {
                    setTimeout(() => setShowBannerPopup(true), 1500);
                }
            }
        } catch (err) {
            console.error('Error fetching global banner:', err);
        }
    };

    const checkAccessAndLoadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Verificar matrícula
            const { data: enrollment, error: enrollmentError } = await supabase
                .from('wemembers_enrollments')
                .select('*')
                .eq('user_id', user!.id)
                .eq('product_id', productId)
                .eq('active', true)
                .single();

            if (enrollmentError || !enrollment) {
                setError('Você não tem acesso a este curso.');
                return;
            }

            setEnrolledAt(enrollment.enrolled_at);

            // Carregar produto
            const { data: productData, error: productError } = await supabase
                .from('wemembers_products')
                .select('*')
                .eq('id', productId)
                .single();

            if (productError) throw productError;
            setProduct(productData);

            // Carregar módulos com aulas
            const { data: modulesData, error: modulesError } = await supabase
                .from('wemembers_modules')
                .select(`
          *,
          lessons (*)
        `)
                .eq('product_id', productId)
                .order('order_index', { ascending: true });

            if (modulesError) throw modulesError;

            // Carregar progresso do usuário
            const { data: progressData } = await supabase
                .from('wemembers_lesson_progress')
                .select('*')
                .eq('user_id', user!.id);

            const progressMap = new Map(
                progressData?.map(p => [p.lesson_id, p]) || []
            );

            // Processar módulos com desbloqueio e progresso
            const processedModules: ModuleWithLessons[] = (modulesData || []).map(module => {
                const unlocked = isModuleUnlocked(enrollment.enrolled_at, module.days_to_unlock);
                const unlockDate = !unlocked
                    ? getUnlockDate(enrollment.enrolled_at, module.days_to_unlock)
                    : undefined;

                const lessonsWithProgress = (module.lessons || [])
                    .sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
                    .map((lesson: Lesson) => ({
                        ...lesson,
                        progress: progressMap.get(lesson.id),
                    }));

                return {
                    ...module,
                    lessons: lessonsWithProgress,
                    is_unlocked: unlocked,
                    unlock_date: unlockDate,
                };
            });

            setModules(processedModules);

            // Definir primeira aula disponível como atual
            const firstAvailableLesson = processedModules
                .filter(m => m.is_unlocked)
                .flatMap(m => m.lessons)
                .find(l => !l.progress?.completed) ||
                processedModules[0]?.lessons[0];

            if (firstAvailableLesson) {
                setCurrentLesson(firstAvailableLesson);
            }

        } catch (err) {
            console.error('Error loading course:', err);
            setError('Erro ao carregar o curso. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Gerar URL assinada para PDF quando a aula mudar
    useEffect(() => {
        const generatePdfUrl = async () => {
            if (currentLesson?.type === 'pdf' && currentLesson.pdf_path) {
                try {
                    const { data, error } = await supabase.storage
                        .from('secure_content')
                        .createSignedUrl(currentLesson.pdf_path, 3600); // 1 hora

                    if (error) {
                        console.error('Error generating signed URL:', error);
                        setPdfUrl(null);
                    } else {
                        setPdfUrl(data.signedUrl);
                    }
                } catch (err) {
                    console.error('Error:', err);
                    setPdfUrl(null);
                }
            } else {
                setPdfUrl(null);
            }
        };

        generatePdfUrl();
    }, [currentLesson]);

    // Salvar progresso do vídeo
    const handleVideoProgress = useCallback(async (progress: { playedSeconds: number; played: number }) => {
        if (!currentLesson || !user || progress.played < 0.9) return;

        // Marcar como completo quando assistir 90%
        await saveProgress(currentLesson.id, true, Math.round(progress.played * 100));
    }, [currentLesson, user]);

    // Salvar progresso do PDF
    const handlePDFProgress = useCallback(async (currentPage: number, totalPages: number) => {
        if (!currentLesson || !user) return;

        const percent = Math.round((currentPage / totalPages) * 100);
        const completed = currentPage >= totalPages;

        await saveProgress(currentLesson.id, completed, percent);
    }, [currentLesson, user]);

    // Função genérica para salvar progresso
    const saveProgress = async (lessonId: string, completed: boolean, progressPercent: number) => {
        if (savingProgress) return;

        console.log('💾 Salvando progresso:', { lessonId, completed, progressPercent });

        setSavingProgress(true);
        try {
            const { data: existing, error: selectError } = await supabase
                .from('wemembers_lesson_progress')
                .select('id')
                .eq('user_id', user!.id)
                .eq('lesson_id', lessonId)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                console.error('❌ Erro ao buscar progresso existente:', selectError);
                throw selectError;
            }

            if (existing) {
                console.log('🔄 Atualizando progresso existente:', existing.id);
                const { error: updateError } = await supabase
                    .from('wemembers_lesson_progress')
                    .update({
                        completed,
                        progress_percent: progressPercent,
                        last_watched_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id);

                if (updateError) {
                    console.error('❌ Erro ao atualizar:', updateError);
                    throw updateError;
                }
                console.log('✅ Progresso atualizado com sucesso!');
            } else {
                console.log('➕ Criando novo registro de progresso');
                const { error: insertError } = await supabase
                    .from('wemembers_lesson_progress')
                    .insert({
                        user_id: user!.id,
                        lesson_id: lessonId,
                        completed,
                        progress_percent: progressPercent,
                    });

                if (insertError) {
                    console.error('❌ Erro ao inserir:', insertError);
                    throw insertError;
                }
                console.log('✅ Progresso criado com sucesso!');
            }

            // Atualizar estado local
            setModules(prev => prev.map(module => ({
                ...module,
                lessons: module.lessons.map(lesson =>
                    lesson.id === lessonId
                        ? { ...lesson, progress: { ...lesson.progress, completed, progress_percent: progressPercent } as LessonProgress }
                        : lesson
                ),
            })));
        } catch (error) {
            console.error('Error saving progress:', error);
        } finally {
            setSavingProgress(false);
        }
    };

    // Marcar aula como completa manualmente
    const handleMarkComplete = async () => {
        if (!currentLesson) return;
        await saveProgress(currentLesson.id, true, 100);
    };

    // Ao terminar vídeo
    const handleVideoEnded = () => {
        if (currentLesson) {
            saveProgress(currentLesson.id, true, 100);
        }
        goToNextLesson();
    };

    // Navegação entre aulas
    const allLessons = modules.filter(m => m.is_unlocked).flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);

    const goToPreviousLesson = () => {
        if (currentIndex > 0) {
            setCurrentLesson(allLessons[currentIndex - 1]);
        }
    };

    const goToNextLesson = () => {
        if (currentIndex < allLessons.length - 1) {
            setCurrentLesson(allLessons[currentIndex + 1]);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-netflix-red animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-netflix-red mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
                    <p className="text-netflix-text-muted mb-6">{error}</p>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="main-content min-h-screen">
                {/* Top Navigation */}
                <header className="sticky top-0 z-30 bg-gradient-to-b from-black to-transparent px-4 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-10 lg:ml-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-white truncate">
                                {product?.title}
                            </h1>
                            {currentLesson && (
                                <p className="text-sm text-netflix-text-muted truncate">
                                    {currentLesson.title}
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="px-4 lg:px-8 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content (Player) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Player Area */}
                            {currentLesson && (
                                <div className="space-y-4">
                                    {currentLesson.type === 'video' && currentLesson.video_url && (
                                        <VideoPlayer
                                            url={currentLesson.video_url}
                                            onProgress={handleVideoProgress}
                                            onEnded={handleVideoEnded}
                                        />
                                    )}

                                    {currentLesson.type === 'pdf' && pdfUrl && (
                                        <PDFReader
                                            pdfUrl={pdfUrl}
                                            onProgress={handlePDFProgress}
                                        />
                                    )}

                                    {/* Lesson Controls */}
                                    <div className="flex items-center justify-between gap-4 p-4 bg-netflix-dark rounded-xl">
                                        <button
                                            onClick={goToPreviousLesson}
                                            disabled={currentIndex <= 0}
                                            className="btn-ghost flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                            <span className="hidden sm:inline">Anterior</span>
                                        </button>

                                        <button
                                            onClick={handleMarkComplete}
                                            className={`btn-ghost flex items-center gap-2 ${(currentLesson as any).progress?.completed ? 'text-green-500' : ''
                                                }`}
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="hidden sm:inline">
                                                {(currentLesson as any).progress?.completed ? 'Concluída' : 'Marcar como concluída'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={goToNextLesson}
                                            disabled={currentIndex >= allLessons.length - 1}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <span className="hidden sm:inline">Próxima</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Lesson Description */}
                                    {currentLesson.description && (
                                        <div className="p-4 bg-netflix-dark rounded-xl">
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                Sobre esta aula
                                            </h3>
                                            <p className="text-netflix-text-muted">
                                                {currentLesson.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Dynamic Banner */}
                                    {currentLesson.banner_img_url && currentLesson.banner_link && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-white mb-3">
                                                Oferta Especial
                                            </h3>
                                            <DynamicBanner
                                                imageUrl={currentLesson.banner_img_url}
                                                linkUrl={currentLesson.banner_link}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar (Lessons List) */}
                        <div className="lg:col-span-1">
                            <LessonsSidebar
                                modules={modules}
                                currentLessonId={currentLesson?.id}
                                onLessonClick={(lesson) => setCurrentLesson(lesson)}
                                className="lg:sticky lg:top-24"
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Banner Popup */}
            {showBannerPopup && globalBanner?.image_url && (
                <BannerPopup
                    imageUrl={globalBanner.image_url}
                    linkUrl={globalBanner.link_url}
                    altText={globalBanner.alt_text}
                    onClose={() => setShowBannerPopup(false)}
                />
            )}
        </div>
    );
}
