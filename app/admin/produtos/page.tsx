'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    MoreVertical,
    BookOpen,
    Eye,
    EyeOff,
    Loader2,
    Image as ImageIcon,
    ChevronRight,
    X
} from 'lucide-react';

interface Product {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    price: number;
    is_published: boolean;
    created_at: string;
    modules_count?: number;
}

export default function AdminProdutosPage() {
    const { success, error: showError } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        is_published: false,
        cover_image: '',
        benefits: [] as string[],
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('wemembers_products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Buscar contagem de módulos para cada produto
            const productsWithModules = await Promise.all(
                (data || []).map(async (product) => {
                    const { count } = await supabase
                        .from('wemembers_modules')
                        .select('*', { count: 'exact', head: true })
                        .eq('product_id', product.id);
                    return { ...product, modules_count: count || 0 };
                })
            );

            setProducts(productsWithModules);
        } catch (err) {
            console.error('Error fetching products:', err);
            showError('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                title: product.title,
                description: product.description || '',
                price: product.price.toString(),
                is_published: product.is_published,
                cover_image: product.cover_image || '',
                benefits: (product as any).benefits || [],
            });
        } else {
            setEditingProduct(null);
            setFormData({
                title: '',
                description: '',
                price: '',
                is_published: false,
                cover_image: '',
                benefits: [],
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            title: '',
            description: '',
            price: '',
            is_published: false,
            cover_image: '',
            benefits: [],
        });
    };

    const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            showError('Arquivo inválido', 'Selecione uma imagem');
            return;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('Arquivo muito grande', 'Máximo 5MB');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cover_${Date.now()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            // Simular progresso
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            const { data, error } = await supabase.storage
                .from('public_assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            clearInterval(progressInterval);

            if (error) throw error;

            // Obter URL pública
            const { data: publicUrl } = supabase.storage
                .from('public_assets')
                .getPublicUrl(filePath);

            setFormData((prev) => ({ ...prev, cover_image: publicUrl.publicUrl }));
            setUploadProgress(100);
            success('Upload concluído!');
        } catch (err: any) {
            console.error('Upload error:', err);
            showError('Erro no upload', err.message);
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            showError('Campo obrigatório', 'Informe o título do produto');
            return;
        }

        setSaving(true);

        try {
            const productData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                is_published: formData.is_published,
                cover_image: formData.cover_image,
                benefits: formData.benefits,
            };

            if (editingProduct) {
                // Update
                const { error } = await supabase
                    .from('wemembers_products')
                    .update(productData)
                    .eq('id', editingProduct.id);

                if (error) throw error;
                success('Produto atualizado!');
            } else {
                // Create
                const { error } = await supabase
                    .from('wemembers_products')
                    .insert(productData);

                if (error) throw error;
                success('Produto criado!');
            }

            handleCloseModal();
            fetchProducts();
        } catch (err: any) {
            console.error('Save error:', err);
            showError('Erro ao salvar', err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('wemembers_products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            success('Produto excluído!');
            setDeleteConfirm(null);
            fetchProducts();
        } catch (err: any) {
            console.error('Delete error:', err);
            showError('Erro ao excluir', err.message);
        }
    };

    const togglePublish = async (product: Product) => {
        try {
            const { error } = await supabase
                .from('wemembers_products')
                .update({ is_published: !product.is_published })
                .eq('id', product.id);

            if (error) throw error;

            success(product.is_published ? 'Produto despublicado' : 'Produto publicado!');
            fetchProducts();
        } catch (err: any) {
            showError('Erro', err.message);
        }
    };

    const filteredProducts = products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-netflix-red animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerenciar Produtos</h1>
                    <p className="text-netflix-text-muted mt-1">
                        {products.length} produto(s) cadastrado(s)
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2 self-start"
                >
                    <Plus className="w-5 h-5" />
                    Novo Produto
                </button>
            </header>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="input-field !pl-12 w-full"
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-netflix-dark rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Produto</th>
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Status</th>
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Preço</th>
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Módulos</th>
                                <th className="text-right p-4 text-sm font-semibold text-netflix-text-muted">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-12 rounded-lg bg-netflix-gray overflow-hidden flex-shrink-0">
                                                {product.cover_image ? (
                                                    <img
                                                        src={product.cover_image}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-netflix-text-muted" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{product.title}</p>
                                                <p className="text-sm text-netflix-text-muted line-clamp-1">
                                                    {product.description || 'Sem descrição'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => togglePublish(product)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${product.is_published
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                }`}
                                        >
                                            {product.is_published ? (
                                                <>
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Publicado
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-3.5 h-3.5" />
                                                    Rascunho
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4 text-white font-medium">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="p-4 text-netflix-text-muted">
                                        {product.modules_count} módulo(s)
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/produtos/${product.id}`}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                Conteúdo
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4 text-netflix-text-muted" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(product.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-netflix-text-muted">
                                        {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Criar/Editar */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={handleCloseModal} />
                    <div className="relative bg-netflix-dark rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
                        <div className="sticky top-0 bg-netflix-dark p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-netflix-text-muted hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Capa do Produto
                                </label>
                                <div className="flex gap-4">
                                    <div className="w-32 h-20 rounded-lg bg-netflix-gray overflow-hidden flex-shrink-0">
                                        {formData.cover_image ? (
                                            <img
                                                src={formData.cover_image}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-netflix-text-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUploadCover}
                                            className="hidden"
                                            id="cover-upload"
                                        />
                                        <label
                                            htmlFor="cover-upload"
                                            className="btn-secondary text-sm cursor-pointer inline-block"
                                        >
                                            {uploading ? 'Enviando...' : 'Escolher arquivo'}
                                        </label>
                                        {uploadProgress > 0 && (
                                            <div className="mt-2 w-full bg-netflix-gray rounded-full h-2">
                                                <div
                                                    className="bg-netflix-red h-2 rounded-full transition-all"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Nome do curso"
                                    className="input-field"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descrição do curso..."
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Preço (R$)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="input-field"
                                />
                            </div>

                            {/* Benefits */}
                            <div>
                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                    Benefícios (O que você vai receber)
                                </label>
                                <div className="space-y-2">
                                    {formData.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={benefit}
                                                onChange={(e) => {
                                                    const newBenefits = [...formData.benefits];
                                                    newBenefits[index] = e.target.value;
                                                    setFormData({ ...formData, benefits: newBenefits });
                                                }}
                                                placeholder="Ex: Acesso vitalício ao conteúdo"
                                                className="input-field flex-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newBenefits = formData.benefits.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, benefits: newBenefits });
                                                }}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ''] })}
                                        className="btn-secondary text-sm w-full"
                                    >
                                        + Adicionar Benefício
                                    </button>
                                </div>
                            </div>

                            {/* Published */}
                            <div className="flex items-center gap-3 p-4 bg-netflix-gray rounded-lg">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-5 h-5 rounded border-netflix-gray-lighter text-netflix-red focus:ring-netflix-red"
                                />
                                <label htmlFor="is_published" className="text-sm text-white cursor-pointer">
                                    Publicar produto (visível na vitrine)
                                </label>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-netflix-dark p-6 border-t border-white/10 flex gap-3">
                            <button onClick={handleCloseModal} className="btn-secondary flex-1">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Exclusão */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-netflix-dark rounded-2xl w-full max-w-sm p-6 border border-white/10 text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Excluir Produto?</h3>
                        <p className="text-netflix-text-muted mb-6">
                            Esta ação não pode ser desfeita. Todos os módulos e aulas serão excluídos.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
