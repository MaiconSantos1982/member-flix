'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            {/* Background Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-netflix-red/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative text-center max-w-md">
                <h1 className="text-9xl font-bold text-netflix-red mb-4">404</h1>
                <h2 className="text-3xl font-bold text-white mb-4">
                    Página não encontrada
                </h2>
                <p className="text-netflix-text-muted mb-8">
                    A página que você está procurando não existe ou foi movida.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="btn-primary flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        Voltar ao Início
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
}
