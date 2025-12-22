'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BannerPopupProps {
    imageUrl: string;
    linkUrl?: string;
    altText?: string;
    onClose: () => void;
}

export function BannerPopup({ imageUrl, linkUrl, altText, onClose }: BannerPopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in animation
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleDontShowAgain = () => {
        localStorage.setItem('banner_popup_dismissed', 'true');
        handleClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
            >
                <div
                    className={`relative bg-netflix-dark rounded-2xl overflow-hidden max-w-2xl w-full pointer-events-auto transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Banner Image */}
                    <a
                        href={linkUrl || '#'}
                        target={linkUrl ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="block"
                        onClick={linkUrl ? handleClose : undefined}
                    >
                        <img
                            src={imageUrl}
                            alt={altText || 'Banner de Oferta'}
                            className="w-full h-auto object-cover max-h-[70vh]"
                        />
                    </a>

                    {/* Footer */}
                    <div className="p-4 bg-netflix-dark border-t border-white/10 flex items-center justify-between">
                        <button
                            onClick={handleDontShowAgain}
                            className="text-sm text-netflix-text-muted hover:text-white transition-colors"
                        >
                            Não mostrar novamente
                        </button>
                        {linkUrl && (
                            <a
                                href={linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleClose}
                                className="btn-primary text-sm"
                            >
                                Acessar Oferta
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
