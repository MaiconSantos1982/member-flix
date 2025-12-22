export default function Loading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
                <p className="text-netflix-text-muted text-sm">Carregando...</p>
            </div>
        </div>
    );
}
