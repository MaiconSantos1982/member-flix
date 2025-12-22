'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Configurar worker via CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFReaderProps {
    pdfUrl: string;
    onProgress?: (currentPage: number, totalPages: number) => void;
    className?: string;
}

export function PDFReader({ pdfUrl, onProgress, className }: PDFReaderProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const { profile } = useAuth();

    // Desabilitar menu de contexto e seleção
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleSelectStart = (e: Event) => {
            e.preventDefault();
            return false;
        };

        container.addEventListener('contextmenu', handleContextMenu);
        container.addEventListener('selectstart', handleSelectStart);

        return () => {
            container.removeEventListener('contextmenu', handleContextMenu);
            container.removeEventListener('selectstart', handleSelectStart);
        };
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const goToPrevPage = () => {
        setPageNumber((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setPageNumber((prev) => Math.min(prev + 1, numPages));
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 2));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    // Notificar progresso
    useEffect(() => {
        if (numPages > 0) {
            onProgress?.(pageNumber, numPages);
        }
    }, [pageNumber, numPages, onProgress]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevPage();
            if (e.key === 'ArrowRight') goToNextPage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [numPages]);

    return (
        <div
            ref={containerRef}
            className={cn('pdf-container no-context-menu relative', className)}
        >
            {/* Controls */}
            <div className="sticky top-0 z-30 flex items-center justify-between p-3 bg-netflix-dark/95 backdrop-blur border-b border-white/10">
                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                        className="p-2 rounded-lg bg-netflix-gray hover:bg-netflix-gray-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm text-netflix-text px-3">
                        Página <strong>{pageNumber}</strong> de <strong>{numPages}</strong>
                    </span>

                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                        className="p-2 rounded-lg bg-netflix-gray hover:bg-netflix-gray-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="hidden sm:block flex-1 max-w-xs mx-4">
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(pageNumber / numPages) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Zoom */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                        className="p-2 rounded-lg bg-netflix-gray hover:bg-netflix-gray-light disabled:opacity-50 transition-colors"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-netflix-text-muted w-12 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        disabled={scale >= 2}
                        className="p-2 rounded-lg bg-netflix-gray hover:bg-netflix-gray-light disabled:opacity-50 transition-colors"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* PDF Document */}
            <div className="relative flex justify-center p-4 min-h-[500px] overflow-auto">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-netflix-dark">
                        <Loader2 className="w-8 h-8 text-netflix-red animate-spin" />
                    </div>
                )}

                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={null}
                    className="pdf-page select-none"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-xl"
                    />
                </Document>

                {/* Watermark overlay */}
                <div className="absolute inset-0 pointer-events-none select-none flex flex-wrap items-center justify-center gap-32 p-8 z-20 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <span
                            key={i}
                            className="text-black/[0.06] dark:text-white/[0.06] text-lg font-light whitespace-nowrap"
                            style={{ transform: `rotate(-15deg)` }}
                        >
                            {profile?.email || 'usuario@email.com'}
                        </span>
                    ))}
                </div>
            </div>

            {/* Mobile Touch Navigation */}
            <div className="sm:hidden fixed bottom-20 left-0 right-0 z-30 flex justify-center gap-4 p-4">
                <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="flex-1 max-w-32 py-3 rounded-lg bg-netflix-gray border border-white/10 disabled:opacity-50 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 mx-auto" />
                </button>
                <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="flex-1 max-w-32 py-3 rounded-lg bg-netflix-red disabled:opacity-50 transition-colors"
                >
                    <ChevronRight className="w-6 h-6 mx-auto" />
                </button>
            </div>
        </div>
    );
}
