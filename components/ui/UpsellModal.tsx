'use client';

import React from 'react';
import Image from 'next/image';
import { X, ShoppingCart, CheckCircle, Play } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/supabase';

interface UpsellModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onBuy?: () => void;
}

export function UpsellModal({ product, isOpen, onClose, onBuy }: UpsellModalProps) {
    if (!isOpen) return null;

    // Usar benefits do produto ou fallback para padrão
    const benefits = product.benefits && product.benefits.length > 0
        ? product.benefits
        : [
            'Acesso vitalício ao conteúdo',
            'Atualizações gratuitas',
            'Suporte da comunidade',
            'Certificado de conclusão',
        ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop"
                onClick={onClose}
            >
                {/* Modal Content */}
                <div
                    className="modal-content p-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image */}
                    <div className="relative h-48 w-full">
                        {product.cover_image ? (
                            <Image
                                src={product.cover_image}
                                alt={product.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-netflix-red to-netflix-dark flex items-center justify-center">
                                <Play className="w-16 h-16 text-white opacity-50" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark to-transparent" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {product.title}
                        </h2>

                        {product.description && (
                            <p className="text-netflix-text-muted mb-6">
                                {product.description}
                            </p>
                        )}

                        {/* Benefits */}
                        <div className="space-y-3 mb-6">
                            <h3 className="text-sm font-semibold text-netflix-text-muted uppercase tracking-wider">
                                O que você vai receber:
                            </h3>
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-netflix-text">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between py-4 border-t border-white/10">
                            <div>
                                <p className="text-sm text-netflix-text-muted">Investimento único</p>
                                <p className="text-3xl font-bold text-white">
                                    {formatCurrency(product.price)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-netflix-text-muted">ou em até</p>
                                <p className="text-sm text-netflix-text">
                                    12x de {formatCurrency(product.price / 12)}
                                </p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={onBuy}
                            className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4 mt-4"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Quero Liberar Acesso
                        </button>

                        {/* Guarantee */}
                        <p className="text-center text-sm text-netflix-text-muted mt-4">
                            🔒 Pagamento 100% seguro • Garantia de 7 dias
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
