'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    GripVertical,
    PlayCircle,
    FileText,
    Save,
    X,
    Loader2,
    Clock,
    Video,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';

interface Module {
    id: string;
    title: string;
    description: string;
    order_index: number;
    days_to_unlock: number;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string;
    type: 'video' | 'pdf';
    video_url: string;
    pdf_path: string;
    duration_seconds: number;
    order_index: number;
    banner_img_url: string;
    banner_link: string;
}

interface Product {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    price: number;
    is_published: boolean;
}

export default async function CourseBuilderPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;

    return <CourseBuilderClient productId={productId} />;
}

function CourseBuilderClient({ productId }: { productId: string }) {
    const router = useRouter();
    const { success, error: showError } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // Modal states
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Module form
    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        days_to_unlock: 0,
    });

    // Lesson form
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        type: 'video' as 'video' | 'pdf',
        video_url: '',
        pdf_path: '',
        duration_seconds: 0,
        banner_img_url: '',
        banner_link: '',
    });

    const [uploadingPDF, setUploadingPDF] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [pdfProgress, setPdfProgress] = useState(0);
    const [bannerProgress, setBannerProgress] = useState(0);

    useEffect(() => {
        fetchProductAndModules();
    }, [productId]);

    const fetchProductAndModules = async () => {
        try {
            // Buscar produto
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (productError) throw productError;
            setProduct(productData);

            // Buscar módulos com aulas
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select('*')
                .eq('product_id', productId)
                .order('order_index', { ascending: true });

            if (modulesError) throw modulesError;

            // Buscar aulas de cada módulo
            const modulesWithLessons = await Promise.all(
                (modulesData || []).map(async (module) => {
                    const { data: lessons } = await supabase
                        .from('lessons')
                        .select('*')
                        .eq('module_id', module.id)
                        .order('order_index', { ascending: true });
                    return { ...module, lessons: lessons || [] };
                })
            );

            setModules(modulesWithLessons);

            // Expandir todos os módulos por padrão
            setExpandedModules(new Set(modulesWithLessons.map(m => m.id)));
        } catch (err) {
            console.error('Error:', err);
            showError('Erro ao carregar produto');
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    // ========== MODULE CRUD ==========
    const openModuleModal = (module?: Module) => {
        if (module) {
            setEditingModule(module);
            setModuleForm({
                title: module.title,
                description: module.description || '',
                days_to_unlock: module.days_to_unlock,
            });
        } else {
            setEditingModule(null);
            setModuleForm({ title: '', description: '', days_to_unlock: 0 });
        }
        setShowModuleModal(true);
    };

    const saveModule = async () => {
        if (!moduleForm.title.trim()) {
            showError('Campo obrigatório', 'Informe o título do módulo');
            return;
        }

        setSaving(true);
        try {
            if (editingModule) {
                const { error } = await supabase
                    .from('modules')
                    .update({
                        title: moduleForm.title,
                        description: moduleForm.description,
                        days_to_unlock: moduleForm.days_to_unlock,
                    })
                    .eq('id', editingModule.id);

                if (error) throw error;
                success('Módulo atualizado!');
            } else {
                const newOrderIndex = modules.length + 1;
                const { error } = await supabase
                    .from('modules')
                    .insert({
                        product_id: productId,
                        title: moduleForm.title,
                        description: moduleForm.description,
                        days_to_unlock: moduleForm.days_to_unlock,
                        order_index: newOrderIndex,
                    });

                if (error) throw error;
                success('Módulo criado!');
            }

            setShowModuleModal(false);
            fetchProductAndModules();
        } catch (err: any) {
            showError('Erro', err.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteModule = async (moduleId: string) => {
        if (!confirm('Excluir módulo e todas as aulas?')) return;

        try {
            const { error } = await supabase
                .from('modules')
                .delete()
                .eq('id', moduleId);

            if (error) throw error;
            success('Módulo excluído!');
            fetchProductAndModules();
        } catch (err: any) {
            showError('Erro', err.message);
        }
    };

    const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
        const index = modules.findIndex(m => m.id === moduleId);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === modules.length - 1)) {
            return;
        }

        const otherIndex = direction === 'up' ? index - 1 : index + 1;
        const currentModule = modules[index];
        const otherModule = modules[otherIndex];

        try {
            await supabase
                .from('modules')
                .update({ order_index: otherModule.order_index })
                .eq('id', currentModule.id);

            await supabase
                .from('modules')
                .update({ order_index: currentModule.order_index })
                .eq('id', otherModule.id);

            fetchProductAndModules();
        } catch (err: any) {
            showError('Erro ao reordenar', err.message);
        }
    };

    // ========== LESSON CRUD ==========
    const openLessonModal = (moduleId: string, lesson?: Lesson) => {
        setSelectedModuleId(moduleId);
        if (lesson) {
            setEditingLesson(lesson);
            setLessonForm({
                title: lesson.title,
                description: lesson.description || '',
                type: lesson.type,
                video_url: lesson.video_url || '',
                pdf_path: lesson.pdf_path || '',
                duration_seconds: lesson.duration_seconds || 0,
                banner_img_url: lesson.banner_img_url || '',
                banner_link: lesson.banner_link || '',
            });
        } else {
            setEditingLesson(null);
            setLessonForm({
                title: '',
                description: '',
                type: 'video',
                video_url: '',
                pdf_path: '',
                duration_seconds: 0,
                banner_img_url: '',
                banner_link: '',
            });
        }
        setShowLessonModal(true);
    };

    const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            showError('Arquivo inválido', 'Selecione um PDF');
            return;
        }

        setUploadingPDF(true);
        setPdfProgress(0);

        try {
            const fileName = `pdf_${Date.now()}.pdf`;
            const filePath = `pdfs/${fileName}`;

            const progressInterval = setInterval(() => {
                setPdfProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            const { error } = await supabase.storage
                .from('secure_content')
                .upload(filePath, file);

            clearInterval(progressInterval);

            if (error) throw error;

            setLessonForm(prev => ({ ...prev, pdf_path: filePath }));
            setPdfProgress(100);
            success('PDF enviado!');
        } catch (err: any) {
            showError('Erro no upload', err.message);
        } finally {
            setUploadingPDF(false);
            setTimeout(() => setPdfProgress(0), 1000);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            showError('Arquivo inválido', 'Selecione uma imagem');
            return;
        }

        setUploadingBanner(true);
        setBannerProgress(0);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `banner_${Date.now()}.${fileExt}`;
            const filePath = `banners/${fileName}`;

            const progressInterval = setInterval(() => {
                setBannerProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            const { error } = await supabase.storage
                .from('public_assets')
                .upload(filePath, file);

            clearInterval(progressInterval);

            if (error) throw error;

            const { data: publicUrl } = supabase.storage
                .from('public_assets')
                .getPublicUrl(filePath);

            setLessonForm(prev => ({ ...prev, banner_img_url: publicUrl.publicUrl }));
            setBannerProgress(100);
            success('Banner enviado!');
        } catch (err: any) {
            showError('Erro no upload', err.message);
        } finally {
            setUploadingBanner(false);
            setTimeout(() => setBannerProgress(0), 1000);
        }
    };

    const saveLesson = async () => {
        if (!lessonForm.title.trim()) {
            showError('Campo obrigatório', 'Informe o título da aula');
            return;
        }

        setSaving(true);
        try {
            const lessonData = {
                title: lessonForm.title,
                description: lessonForm.description,
                type: lessonForm.type,
                video_url: lessonForm.type === 'video' ? lessonForm.video_url : null,
                pdf_path: lessonForm.type === 'pdf' ? lessonForm.pdf_path : null,
                duration_seconds: lessonForm.duration_seconds || null,
                banner_img_url: lessonForm.banner_img_url || null,
                banner_link: lessonForm.banner_link || null,
            };

            if (editingLesson) {
                const { error } = await supabase
                    .from('lessons')
                    .update(lessonData)
                    .eq('id', editingLesson.id);

                if (error) throw error;
                success('Aula atualizada!');
            } else {
                const module = modules.find(m => m.id === selectedModuleId);
                const newOrderIndex = (module?.lessons.length || 0) + 1;

                const { error } = await supabase
                    .from('lessons')
                    .insert({
                        ...lessonData,
                        module_id: selectedModuleId,
                        order_index: newOrderIndex,
                    });

                if (error) throw error;
                success('Aula criada!');
            }

            setShowLessonModal(false);
            fetchProductAndModules();
        } catch (err: any) {
            showError('Erro', err.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteLesson = async (lessonId: string) => {
        if (!confirm('Excluir esta aula?')) return;

        try {
            const { error } = await supabase
                .from('lessons')
                .delete()
                .eq('id', lessonId);

            if (error) throw error;
            success('Aula excluída!');
            fetchProductAndModules();
        } catch (err: any) {
            showError('Erro', err.message);
        }
    };

    const moveLesson = async (lesson: Lesson, direction: 'up' | 'down') => {
        const module = modules.find(m => m.id === lesson.module_id);
        if (!module) return;

        const index = module.lessons.findIndex(l => l.id === lesson.id);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === module.lessons.length - 1)) {
            return;
        }

        const otherIndex = direction === 'up' ? index - 1 : index + 1;
        const otherLesson = module.lessons[otherIndex];

        try {
            await supabase
                .from('lessons')
                .update({ order_index: otherLesson.order_index })
                .eq('id', lesson.id);

            await supabase
                .from('lessons')
                .update({ order_index: lesson.order_index })
                .eq('id', otherLesson.id);

            fetchProductAndModules();
        } catch (err: any) {
            showError('Erro ao reordenar', err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-netflix-red animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-8 text-center">
                <p className="text-netflix-text-muted">Produto não encontrado</p>
                <Link href="/admin/produtos" className="text-netflix-red hover:underline">
                    Voltar
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <header className="mb-8">
                <Link
                    href="/admin/produtos"
                    className="inline-flex items-center gap-2 text-netflix-text-muted hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Produtos
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{product.title}</h1>
                        <p className="text-netflix-text-muted mt-1">
                            {modules.length} módulo(s) · {modules.reduce((acc, m) => acc + m.lessons.length, 0)} aula(s)
                        </p>
                    </div>
                    <button
                        onClick={() => openModuleModal()}
                        className="btn-primary flex items-center gap-2 self-start"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Módulo
                    </button>
                </div>
            </header>

            {/* Modules List */}
            <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                    <div
                        key={module.id}
                        className="bg-netflix-dark rounded-xl border border-white/5 overflow-hidden"
                    >
                        {/* Module Header */}
                        <div className="flex items-center gap-4 p-4 bg-netflix-gray">
                            <div className="flex items-center gap-2 text-netflix-text-muted">
                                <button
                                    onClick={() => moveModule(module.id, 'up')}
                                    disabled={moduleIndex === 0}
                                    className="p-1 hover:text-white disabled:opacity-30"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => moveModule(module.id, 'down')}
                                    disabled={moduleIndex === modules.length - 1}
                                    className="p-1 hover:text-white disabled:opacity-30"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={() => toggleModule(module.id)}
                                className="flex-1 flex items-center gap-3 text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-netflix-red/20 flex items-center justify-center text-netflix-red font-bold text-sm">
                                    {moduleIndex + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{module.title}</p>
                                    <p className="text-xs text-netflix-text-muted">
                                        {module.lessons.length} aula(s)
                                        {module.days_to_unlock > 0 && (
                                            <span className="ml-2">
                                                <Clock className="w-3 h-3 inline mr-1" />
                                                Libera em {module.days_to_unlock} dias
                                            </span>
                                        )}
                                    </p>
                                </div>
                                {expandedModules.has(module.id) ? (
                                    <ChevronUp className="w-5 h-5 text-netflix-text-muted" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-netflix-text-muted" />
                                )}
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openModuleModal(module)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Editar módulo"
                                >
                                    <Edit className="w-4 h-4 text-netflix-text-muted" />
                                </button>
                                <button
                                    onClick={() => deleteModule(module.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Excluir módulo"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        </div>

                        {/* Lessons */}
                        {expandedModules.has(module.id) && (
                            <div className="p-4 space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center gap-4 p-3 bg-netflix-gray/50 rounded-lg hover:bg-netflix-gray transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-netflix-text-muted">
                                            <button
                                                onClick={() => moveLesson(lesson, 'up')}
                                                disabled={lessonIndex === 0}
                                                className="p-1 hover:text-white disabled:opacity-30"
                                            >
                                                <ChevronUp className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => moveLesson(lesson, 'down')}
                                                disabled={lessonIndex === module.lessons.length - 1}
                                                className="p-1 hover:text-white disabled:opacity-30"
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                            {lesson.type === 'video' ? (
                                                <PlayCircle className="w-4 h-4 text-blue-400" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-orange-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
                                            <p className="text-xs text-netflix-text-muted">
                                                {lesson.type === 'video' ? 'Vídeo' : 'PDF'}
                                                {lesson.duration_seconds && ` · ${Math.round(lesson.duration_seconds / 60)} min`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openLessonModal(module.id, lesson)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Editar aula"
                                            >
                                                <Edit className="w-4 h-4 text-netflix-text-muted" />
                                            </button>
                                            <button
                                                onClick={() => deleteLesson(lesson.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir aula"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => openLessonModal(module.id)}
                                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/10 rounded-lg text-netflix-text-muted hover:border-netflix-red hover:text-netflix-red transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Aula
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {modules.length === 0 && (
                    <div className="text-center py-12 bg-netflix-dark rounded-xl border border-white/5">
                        <p className="text-netflix-text-muted mb-4">Nenhum módulo criado ainda</p>
                        <button
                            onClick={() => openModuleModal()}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Criar Primeiro Módulo
                        </button>
                    </div>
                )}
            </div>

            {/* Module Modal */}
            {showModuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowModuleModal(false)} />
                    <div className="relative bg-netflix-dark rounded-2xl w-full max-w-md border border-white/10">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
                            </h2>
                            <button onClick={() => setShowModuleModal(false)} className="text-netflix-text-muted hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={moduleForm.title}
                                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                    placeholder="Ex: Módulo 1 - Introdução"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={moduleForm.description}
                                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                    placeholder="Descrição do módulo..."
                                    rows={2}
                                    className="input-field resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Liberar após (dias)
                                </label>
                                <input
                                    type="number"
                                    value={moduleForm.days_to_unlock}
                                    onChange={(e) => setModuleForm({ ...moduleForm, days_to_unlock: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    className="input-field"
                                />
                                <p className="text-xs text-netflix-text-muted mt-1">
                                    0 = liberado imediatamente
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button onClick={() => setShowModuleModal(false)} className="btn-secondary flex-1">
                                Cancelar
                            </button>
                            <button
                                onClick={saveModule}
                                disabled={saving}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Modal */}
            {showLessonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowLessonModal(false)} />
                    <div className="relative bg-netflix-dark rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
                        <div className="sticky top-0 bg-netflix-dark p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingLesson ? 'Editar Aula' : 'Nova Aula'}
                            </h2>
                            <button onClick={() => setShowLessonModal(false)} className="text-netflix-text-muted hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    placeholder="Ex: Aula 1 - Boas-vindas"
                                    className="input-field"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={lessonForm.description}
                                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                    placeholder="Descrição da aula..."
                                    rows={2}
                                    className="input-field resize-none"
                                />
                            </div>

                            {/* Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Tipo de Conteúdo
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setLessonForm({ ...lessonForm, type: 'video' })}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${lessonForm.type === 'video'
                                            ? 'border-netflix-red bg-netflix-red/10 text-netflix-red'
                                            : 'border-white/10 text-netflix-text-muted hover:border-white/30'
                                            }`}
                                    >
                                        <Video className="w-6 h-6" />
                                        <span className="text-sm font-medium">Vídeo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLessonForm({ ...lessonForm, type: 'pdf' })}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${lessonForm.type === 'pdf'
                                            ? 'border-netflix-red bg-netflix-red/10 text-netflix-red'
                                            : 'border-white/10 text-netflix-text-muted hover:border-white/30'
                                            }`}
                                    >
                                        <FileText className="w-6 h-6" />
                                        <span className="text-sm font-medium">PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Video Fields */}
                            {lessonForm.type === 'video' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-netflix-text mb-2">
                                            URL do Vídeo
                                        </label>
                                        <input
                                            type="url"
                                            value={lessonForm.video_url}
                                            onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                                            placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                                            className="input-field"
                                        />
                                        <p className="text-xs text-netflix-text-muted mt-1">
                                            Suporta YouTube, Vimeo, ou link direto MP4
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-netflix-text mb-2">
                                            Duração (minutos)
                                        </label>
                                        <input
                                            type="number"
                                            value={Math.round(lessonForm.duration_seconds / 60) || ''}
                                            onChange={(e) => setLessonForm({ ...lessonForm, duration_seconds: parseInt(e.target.value) * 60 || 0 })}
                                            min="0"
                                            className="input-field"
                                        />
                                    </div>
                                </>
                            )}

                            {/* PDF Fields */}
                            {lessonForm.type === 'pdf' && (
                                <div>
                                    <label className="block text-sm font-medium text-netflix-text mb-2">
                                        Arquivo PDF
                                    </label>
                                    {lessonForm.pdf_path ? (
                                        <div className="flex items-center gap-3 p-3 bg-netflix-gray rounded-lg">
                                            <FileText className="w-8 h-8 text-orange-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-white">PDF carregado</p>
                                                <p className="text-xs text-netflix-text-muted truncate">{lessonForm.pdf_path}</p>
                                            </div>
                                            <button
                                                onClick={() => setLessonForm({ ...lessonForm, pdf_path: '' })}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handlePDFUpload}
                                                className="hidden"
                                                id="pdf-upload"
                                            />
                                            <label
                                                htmlFor="pdf-upload"
                                                className="block w-full p-6 border-2 border-dashed border-white/10 rounded-lg text-center cursor-pointer hover:border-netflix-red transition-colors"
                                            >
                                                <FileText className="w-8 h-8 text-netflix-text-muted mx-auto mb-2" />
                                                <p className="text-sm text-netflix-text-muted">
                                                    {uploadingPDF ? 'Enviando...' : 'Clique para enviar PDF'}
                                                </p>
                                            </label>
                                        </>
                                    )}
                                    {pdfProgress > 0 && (
                                        <div className="mt-2 w-full bg-netflix-gray rounded-full h-2">
                                            <div
                                                className="bg-netflix-red h-2 rounded-full transition-all"
                                                style={{ width: `${pdfProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Banner de Vendas */}
                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-sm font-semibold text-white mb-4">
                                    Configuração de Vendas (Opcional)
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-netflix-text mb-2">
                                            Banner de Venda
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="w-24 h-14 rounded-lg bg-netflix-gray overflow-hidden flex-shrink-0">
                                                {lessonForm.banner_img_url ? (
                                                    <img
                                                        src={lessonForm.banner_img_url}
                                                        alt="Banner"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-netflix-text-muted" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleBannerUpload}
                                                    className="hidden"
                                                    id="banner-upload"
                                                />
                                                <label
                                                    htmlFor="banner-upload"
                                                    className="btn-secondary text-sm cursor-pointer inline-block"
                                                >
                                                    {uploadingBanner ? 'Enviando...' : 'Enviar banner'}
                                                </label>
                                                {bannerProgress > 0 && (
                                                    <div className="mt-2 w-full bg-netflix-gray rounded-full h-2">
                                                        <div
                                                            className="bg-netflix-red h-2 rounded-full transition-all"
                                                            style={{ width: `${bannerProgress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-netflix-text mb-2">
                                            Link de Destino do Banner
                                        </label>
                                        <input
                                            type="url"
                                            value={lessonForm.banner_link}
                                            onChange={(e) => setLessonForm({ ...lessonForm, banner_link: e.target.value })}
                                            placeholder="https://..."
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-netflix-dark p-6 border-t border-white/10 flex gap-3">
                            <button onClick={() => setShowLessonModal(false)} className="btn-secondary flex-1">
                                Cancelar
                            </button>
                            <button
                                onClick={saveLesson}
                                disabled={saving}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Salvar Aula
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
