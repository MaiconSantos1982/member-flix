'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                    Ops! Algo deu errado
                </h1>
                <p className="text-netflix-text-muted mb-8">
                    Ocorreu um erro inesperado. Por favor, tente novamente.
                </p>
                <button
                    onClick={reset}
                    className="btn-primary flex items-center justify-center gap-2 mx-auto"
                >
                    <RefreshCw className="w-5 h-5" />
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
}
