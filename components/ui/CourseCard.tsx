'use client';

import React from 'react';
import Image from 'next/image';
import { Lock, Play, Clock } from 'lucide-react';
import { cn, formatCurrency, truncateText } from '@/lib/utils';
import { ProductWithAccess } from '@/lib/supabase';

interface CourseCardProps {
    product: ProductWithAccess;
    onLockedClick?: () => void;
    onClick?: () => void;
    className?: string;
}

export function CourseCard({ product, onLockedClick, onClick, className }: CourseCardProps) {
    const { title, description, cover_image, price, has_access } = product;

    const handleClick = () => {
        if (has_access) {
            onClick?.();
        } else {
            onLockedClick?.();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                'card-course group relative cursor-pointer',
                className
            )}
        >
            {/* Cover Image */}
            <div className="absolute inset-0">
                {cover_image ? (
                    <Image
                        src={cover_image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-netflix-gray to-netflix-dark flex items-center justify-center">
                        <Play className="w-12 h-12 text-netflix-text-muted" />
                    </div>
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Lock Badge (if no access) */}
            {!has_access && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-black/80 backdrop-blur-sm rounded-full p-2 lock-pulse">
                        <Lock className="w-4 h-4 text-white" />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-netflix-red transition-colors">
                    {truncateText(title, 50)}
                </h3>

                {description && (
                    <p className="text-sm text-netflix-text-muted line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                        {truncateText(description, 100)}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-2">
                    {has_access ? (
                        <div className="flex items-center gap-2 text-sm text-green-500">
                            <Play className="w-4 h-4" />
                            <span>Assistir agora</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-netflix-red font-bold">
                            <span>{formatCurrency(price)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Play Button */}
            {has_access && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-black ml-1" fill="black" />
                    </div>
                </div>
            )}
        </div>
    );
}

// Skeleton Loading Card
export function CourseCardSkeleton() {
    return (
        <div className="aspect-video rounded-lg bg-netflix-gray skeleton-shimmer overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="h-5 bg-netflix-gray-light rounded w-3/4 mb-2" />
                <div className="h-3 bg-netflix-gray-light rounded w-1/2" />
            </div>
        </div>
    );
}
