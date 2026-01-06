'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, ProductWithAccess } from '@/lib/supabase';
import { Sidebar } from '@/components/layout/Sidebar';
import { CourseCard, CourseCardSkeleton } from '@/components/ui/CourseCard';
import { UpsellModal } from '@/components/ui/UpsellModal';
import { Search, Filter, Grid, List } from 'lucide-react';

export default function CatalogoPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<ProductWithAccess[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProduct, setSelectedProduct] = useState<ProductWithAccess | null>(null);
    const [showUpsellModal, setShowUpsellModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchProducts();
        }
    }, [user, authLoading, router]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const { data: productsData, error: productsError } = await supabase
                .from('wemembers_products')
                .select('*')
                .eq('is_published', true)
                .order('title', { ascending: true });

            if (productsError) throw productsError;

            const { data: enrollmentsData } = await supabase
                .from('wemembers_enrollments')
                .select('product_id')
                .eq('user_id', user!.id)
                .eq('active', true);

            const enrolledProductIds = new Set(enrollmentsData?.map(e => e.product_id) || []);

            const productsWithAccess: ProductWithAccess[] = (productsData || []).map(product => ({
                ...product,
                has_access: enrolledProductIds.has(product.id),
            }));

            setProducts(productsWithAccess);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCardClick = (product: ProductWithAccess) => {
        if (product.has_access) {
            router.push(`/watch/${product.id}`);
        } else {
            setSelectedProduct(product);
            setShowUpsellModal(true);
        }
    };

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
                        Catálogo
                    </h1>
                    <p className="text-netflix-text-muted">
                        Explore todos os cursos disponíveis
                    </p>
                </header>

                {/* Filters */}
                <div className="px-4 lg:px-8 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                            <input
                                type="text"
                                placeholder="Buscar cursos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-12 w-full"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-lg transition-colors ${viewMode === 'grid'
                                        ? 'bg-netflix-red text-white'
                                        : 'bg-netflix-gray text-netflix-text-muted hover:text-white'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-lg transition-colors ${viewMode === 'list'
                                        ? 'bg-netflix-red text-white'
                                        : 'bg-netflix-gray text-netflix-text-muted hover:text-white'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="px-4 lg:px-8 mb-4">
                    <p className="text-sm text-netflix-text-muted">
                        {filteredProducts.length} curso{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Products Grid/List */}
                <div className="px-4 lg:px-8">
                    {loading ? (
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                            }`}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                            }`}>
                            {filteredProducts.map((product) => (
                                <CourseCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleCardClick(product)}
                                    onLockedClick={() => handleCardClick(product)}
                                    className={viewMode === 'list' ? 'aspect-[3/1]' : ''}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Search className="w-16 h-16 text-netflix-text-muted mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Nenhum resultado
                            </h2>
                            <p className="text-netflix-text-muted">
                                Não encontramos cursos para &quot;{searchQuery}&quot;
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Upsell Modal */}
            {selectedProduct && (
                <UpsellModal
                    product={selectedProduct}
                    isOpen={showUpsellModal}
                    onClose={() => setShowUpsellModal(false)}
                    onBuy={() => {
                        alert(`Redirecionando para checkout: ${selectedProduct.title}`);
                        setShowUpsellModal(false);
                    }}
                />
            )}
        </div>
    );
}
