'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    showControls?: boolean;
}

export function Carousel({ title, children, className, showControls = true }: CarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!trackRef.current) return;

        const container = trackRef.current;
        const scrollAmount = container.clientWidth * 0.8;

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className={cn('carousel-container group/carousel', className)}>
            {/* Header */}
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl lg:text-2xl font-bold text-white">{title}</h2>
                </div>
            )}

            {/* Controls */}
            {showControls && (
                <>
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full 
                       bg-gradient-to-r from-black/80 to-transparent 
                       opacity-0 group-hover/carousel:opacity-100 transition-opacity
                       flex items-center justify-center"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full 
                       bg-gradient-to-l from-black/80 to-transparent 
                       opacity-0 group-hover/carousel:opacity-100 transition-opacity
                       flex items-center justify-center"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </button>
                </>
            )}

            {/* Track */}
            <div ref={trackRef} className="carousel-track">
                {children}
            </div>
        </div>
    );
}

// Wrapper for carousel items
export function CarouselItem({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('carousel-item', className)}>
            {children}
        </div>
    );
}
