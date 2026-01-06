'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, ProductWithAccess, Product } from '@/lib/supabase';
import { Sidebar } from '@/components/layout/Sidebar';
import { KindleCard, KindleCardSkeleton } from '@/components/ui/KindleCard';
import { UpsellModal } from '@/components/ui/UpsellModal';
import { Search, BookOpen, ShoppingBag, Sparkles } from 'lucide-react';

interface ProductWithProgress extends ProductWithAccess {
  lessonsCompleted?: number;
  totalLessons?: number;
  contentType?: 'video' | 'pdf' | 'both';
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myProducts, setMyProducts] = useState<ProductWithProgress[]>([]);
  const [storeProducts, setStoreProducts] = useState<ProductWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProducts();
      fetchUserProfile();
    }
  }, [user, authLoading, router]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user!.id)
        .single();

      if (data?.full_name) {
        setUserName(data.full_name.split(' ')[0]);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Buscar produtos publicados ordenados alfabeticamente
      const { data: productsData, error: productsError } = await supabase
        .from('wemembers_products')
        .select('*')
        .eq('is_published', true)
        .order('title', { ascending: true });

      if (productsError) throw productsError;

      // Buscar matrículas do usuário
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('wemembers_enrollments')
        .select('product_id')
        .eq('user_id', user!.id)
        .eq('active', true);

      if (enrollmentsError) throw enrollmentsError;

      const enrolledProductIds = new Set(enrollmentsData?.map(e => e.product_id) || []);

      // Para cada produto matriculado, calcular progresso e tipo de conteúdo
      const productsWithDetails = await Promise.all(
        (productsData || []).map(async (product) => {
          const hasAccess = enrolledProductIds.has(product.id);

          // Buscar módulos do produto
          const { data: modulesData } = await supabase
            .from('wemembers_modules')
            .select('id')
            .eq('product_id', product.id);

          const moduleIds = modulesData?.map(m => m.id) || [];

          // Buscar aulas do produto para determinar tipo de conteúdo
          const { data: lessonsData } = await supabase
            .from('wemembers_lessons')
            .select('id, type')
            .in('module_id', moduleIds);

          const totalLessons = lessonsData?.length || 0;

          // Determinar tipo de conteúdo
          const hasVideo = lessonsData?.some(l => l.type === 'video');
          const hasPdf = lessonsData?.some(l => l.type === 'pdf');
          let contentType: 'video' | 'pdf' | 'both' = 'video';
          if (hasVideo && hasPdf) contentType = 'both';
          else if (hasPdf) contentType = 'pdf';

          let lessonsCompleted = 0;
          if (hasAccess && lessonsData && lessonsData.length > 0) {
            const lessonIds = lessonsData.map(l => l.id);
            const { count } = await supabase
              .from('wemembers_lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user!.id)
              .in('lesson_id', lessonIds)
              .eq('completed', true);

            lessonsCompleted = count || 0;
          }

          return {
            ...product,
            has_access: hasAccess,
            lessonsCompleted,
            totalLessons,
            contentType,
          };
        })
      );

      // Separar produtos em "Meus Cursos" e "Vitrine"
      const myProductsList = productsWithDetails.filter(p => p.has_access);
      const storeProductsList = productsWithDetails.filter(p => !p.has_access);

      setMyProducts(myProductsList);
      setStoreProducts(storeProductsList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (product: ProductWithProgress) => {
    router.push(`/watch/${product.id}`);
  };

  const handleLockedClick = (product: ProductWithProgress) => {
    setSelectedProduct(product);
    setShowUpsellModal(true);
  };

  const handleBuy = () => {
    alert(`Redirecionando para checkout do produto: ${selectedProduct?.title}`);
    setShowUpsellModal(false);
  };

  // Filtrar produtos por busca
  const filteredMyProducts = myProducts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStoreProducts = storeProducts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular progresso em porcentagem
  const calculateProgress = (completed?: number, total?: number) => {
    if (!total || total === 0) return 0;
    return Math.round((completed || 0) / total * 100);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-kindle-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen kindle-bg">
      <Sidebar />

      <main className="main-content min-h-screen pb-24">
        {/* Header com saudação */}
        <header className="sticky top-0 z-30 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/95 to-transparent px-4 lg:px-8 py-4 pt-6">
          {/* Saudação */}
          <div className="mb-4 ml-12 lg:ml-0">
            <h1 className="text-xl lg:text-2xl font-semibold text-white">
              Olá{userName ? `, ${userName}` : ''}! 👋
            </h1>
            {myProducts.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Você tem {myProducts.length} {myProducts.length === 1 ? 'curso' : 'cursos'} para explorar
              </p>
            )}
          </div>

          {/* Barra de busca */}
          <div className="relative flex-1 max-w-xl ml-12 lg:ml-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="kindle-search-input"
            />
          </div>
        </header>

        {/* Content */}
        <div className="px-4 lg:px-8 space-y-8 mt-4">
          {/* Seção: Meus Cursos */}
          {(filteredMyProducts.length > 0 || loading) && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-white">Meus Cursos</h2>
                  <p className="text-xs text-gray-500">Continue de onde parou</p>
                </div>
              </div>

              <div className="kindle-grid">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <KindleCardSkeleton key={i} />
                  ))
                ) : (
                  filteredMyProducts.map((product) => (
                    <KindleCard
                      key={product.id}
                      product={product}
                      contentType={product.contentType}
                      progress={calculateProgress(product.lessonsCompleted, product.totalLessons)}
                      onClick={() => handleCardClick(product)}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Seção: Você também pode comprar */}
          {(filteredStoreProducts.length > 0 || loading) && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-white">Você também pode comprar</h2>
                  <p className="text-xs text-gray-500">Expanda seus conhecimentos</p>
                </div>
              </div>

              <div className="kindle-grid">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <KindleCardSkeleton key={i} />
                  ))
                ) : (
                  filteredStoreProducts.map((product) => (
                    <KindleCard
                      key={product.id}
                      product={product}
                      contentType={product.contentType}
                      onLockedClick={() => handleLockedClick(product)}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!loading && filteredMyProducts.length === 0 && filteredStoreProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Nenhum curso encontrado
              </h2>
              <p className="text-gray-400 max-w-md">
                {searchQuery
                  ? `Não encontramos cursos para "${searchQuery}". Tente uma busca diferente.`
                  : 'Novos cursos serão adicionados em breve!'}
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
          onBuy={handleBuy}
        />
      )}
    </div>
  );
}