'use client';

import React from 'react';
import Image from 'next/image';
import { Lock, Play, FileText, Video, BookOpen } from 'lucide-react';
import { cn, truncateText } from '@/lib/utils';
import { ProductWithAccess } from '@/lib/supabase';

interface KindleCardProps {
    product: ProductWithAccess;
    contentType?: 'video' | 'pdf' | 'both';
    progress?: number;
    onLockedClick?: () => void;
    onClick?: () => void;
    className?: string;
}

export function KindleCard({
    product,
    contentType = 'video',
    progress = 0,
    onLockedClick,
    onClick,
    className
}: KindleCardProps) {
    const { title, description, cover_image, has_access } = product;

    const handleClick = () => {
        if (has_access) {
            onClick?.();
        } else {
            onLockedClick?.();
        }
    };

    const getContentIcon = () => {
        switch (contentType) {
            case 'video':
                return (
                    <div className="content-type-badge video">
                        <Video className="w-3.5 h-3.5" />
                    </div>
                );
            case 'pdf':
                return (
                    <div className="content-type-badge pdf">
                        <FileText className="w-3.5 h-3.5" />
                    </div>
                );
            case 'both':
                return (
                    <div className="flex gap-1">
                        <div className="content-type-badge video">
                            <Video className="w-3.5 h-3.5" />
                        </div>
                        <div className="content-type-badge pdf">
                            <FileText className="w-3.5 h-3.5" />
                        </div>
                    </div>
                );
        }
    };

    // Determina a cor da barra de progresso
    const getProgressColor = () => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-purple-500';
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                'kindle-card group relative cursor-pointer',
                !has_access && 'locked',
                className
            )}
        >
            {/* Cover Image */}
            <div className="kindle-card-cover">
                {cover_image ? (
                    <Image
                        src={cover_image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/50" />
                    </div>
                )}

                {/* Content Type Badge */}
                <div className="absolute top-2 right-2 z-10">
                    {getContentIcon()}
                </div>

                {/* Lock Badge (if no access) */}
                {!has_access && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="bg-black/80 backdrop-blur-sm rounded-full p-3">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                )}

                {/* Hover Play Button (if has access) */}
                {has_access && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                        </div>
                    </div>
                )}
            </div>

            {/* Card Info */}
            <div className="kindle-card-info">
                <h3 className="kindle-card-title">
                    {truncateText(title, 40)}
                </h3>

                {/* Description */}
                {description && (
                    <p className="kindle-card-description">
                        {truncateText(description, 80)}
                    </p>
                )}

                {/* Progress Bar (only if has access and progress > 0) */}
                {has_access && progress > 0 && (
                    <div className="kindle-progress-bar">
                        <div
                            className={cn('kindle-progress-fill', getProgressColor())}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                )}

                {/* Status indicator */}
                {has_access ? (
                    progress >= 100 ? (
                        <span className="kindle-status completed">Concluído</span>
                    ) : progress > 0 ? (
                        <span className="kindle-status in-progress">{progress}% concluído</span>
                    ) : null
                ) : (
                    <span className="kindle-status locked">Bloqueado</span>
                )}
            </div>
        </div>
    );
}

// Skeleton Loading Card
export function KindleCardSkeleton() {
    return (
        <div className="kindle-card skeleton-shimmer">
            <div className="kindle-card-cover bg-netflix-gray" />
            <div className="kindle-card-info">
                <div className="h-4 bg-netflix-gray-light rounded w-3/4 mb-2" />
                <div className="h-1.5 bg-netflix-gray-light rounded w-full" />
            </div>
        </div>
    );
}
