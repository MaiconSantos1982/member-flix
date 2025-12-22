'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicBannerProps {
    imageUrl: string;
    linkUrl: string;
    altText?: string;
    className?: string;
}

export function DynamicBanner({
    imageUrl,
    linkUrl,
    altText = 'Banner promocional',
    className
}: DynamicBannerProps) {
    const isExternalLink = linkUrl.startsWith('http');

    const BannerContent = () => (
        <div className={cn(
            'relative w-full aspect-[4/1] min-h-[100px] max-h-[200px] rounded-xl overflow-hidden group cursor-pointer',
            'hover:ring-2 hover:ring-netflix-red transition-all duration-300',
            className
        )}>
            <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <ExternalLink className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-netflix-red/50 transition-colors" />
        </div>
    );

    if (isExternalLink) {
        return (
            <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <BannerContent />
            </a>
        );
    }

    return (
        <Link href={linkUrl} className="block">
            <BannerContent />
        </Link>
    );
}

// Container para múltiplos banners
interface BannerSectionProps {
    banners: Array<{
        imageUrl: string;
        linkUrl: string;
    }>;
    title?: string;
    className?: string;
}

export function BannerSection({ banners, title, className }: BannerSectionProps) {
    if (!banners || banners.length === 0) return null;

    return (
        <div className={cn('space-y-4', className)}>
            {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            )}
            <div className="space-y-3">
                {banners.map((banner, index) => (
                    <DynamicBanner
                        key={index}
                        imageUrl={banner.imageUrl}
                        linkUrl={banner.linkUrl}
                    />
                ))}
            </div>
        </div>
    );
}
