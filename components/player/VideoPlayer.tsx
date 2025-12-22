'use client';

import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
    url: string;
    onProgress?: (progress: { playedSeconds: number; played: number }) => void;
    onEnded?: () => void;
    initialProgress?: number;
    className?: string;
}

export function VideoPlayer({
    url,
    onProgress,
    onEnded,
    initialProgress = 0,
    className
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<ReactPlayer>(null);
    const { profile } = useAuth();

    // Desabilitar menu de contexto (clique direito)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        container.addEventListener('contextmenu', handleContextMenu);

        return () => {
            container.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Seek para posição inicial ao carregar
    const handleReady = () => {
        if (initialProgress > 0 && playerRef.current) {
            playerRef.current.seekTo(initialProgress, 'seconds');
        }
    };

    // Gerar watermarks aleatórias
    const generateWatermarks = () => {
        const positions = [
            { top: '20%', left: '15%' },
            { top: '50%', left: '50%' },
            { top: '75%', left: '80%' },
            { top: '30%', left: '70%' },
            { top: '60%', left: '25%' },
        ];

        return positions.map((pos, index) => (
            <div
                key={index}
                className="absolute pointer-events-none select-none z-20"
                style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
            >
                <span className="text-white/[0.08] text-sm font-light whitespace-nowrap rotate-[-15deg] inline-block">
                    {profile?.email || 'usuario@email.com'}
                </span>
            </div>
        ));
    };

    return (
        <div
            ref={containerRef}
            className={cn('player-container no-context-menu relative', className)}
        >
            {/* Video Player */}
            <ReactPlayer
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                controls
                playing={false}
                onReady={handleReady}
                onProgress={onProgress}
                onEnded={onEnded}
                config={{
                    youtube: {
                        playerVars: {
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                        },
                    },
                    vimeo: {
                        playerOptions: {
                            byline: false,
                            portrait: false,
                            title: false,
                        },
                    },
                }}
            />

            {/* Watermarks */}
            {generateWatermarks()}

            {/* Additional overlay to prevent screenshot (visual deterrent) */}
            <div className="absolute inset-0 pointer-events-none z-10" />
        </div>
    );
}
