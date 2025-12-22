'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Image as ImageIcon, ExternalLink, Save, Loader2, Eye, EyeOff } from 'lucide-react';

export function GlobalBannerSettings() {
    const { success, error: showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [banner, setBanner] = useState({
        enabled: false,
        image_url: '',
        link_url: '',
        alt_text: 'Banner de Oferta',
        show_as_popup: false,
    });

    useEffect(() => {
        fetchBanner();
    }, []);

    const fetchBanner = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'global_banner')
                .single();

            if (!error && data) {
                setBanner(data.value as any);
            }
        } catch (err) {
            console.error('Error fetching banner:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Arquivo inválido', 'Selecione uma imagem');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `banner_${Date.now()}.${fileExt}`;
            const filePath = `banners/${fileName}`;

            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            const { error } = await supabase.storage
                .from('public_assets')
                .upload(filePath, file);

            clearInterval(progressInterval);

            if (error) throw error;

            const { data: publicUrl } = supabase.storage
                .from('public_assets')
                .getPublicUrl(filePath);

            setBanner((prev) => ({ ...prev, image_url: publicUrl.publicUrl }));
            setUploadProgress(100);
            success('Imagem enviada!');
        } catch (err: any) {
            showError('Erro no upload', err.message);
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            // Usar UPDATE em vez de UPSERT
            const { error } = await supabase
                .from('settings')
                .update({ value: banner })
                .eq('key', 'global_banner');

            if (error) throw error;

            success('Banner atualizado!');
        } catch (err: any) {
            showError('Erro ao salvar', err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-netflix-red animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Banner Global</h2>
            <p className="text-sm text-netflix-text-muted">
                Configure um banner que aparecerá no topo da página inicial para todos os usuários.
            </p>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-netflix-gray rounded-lg">
                <div>
                    <p className="font-medium text-white">Exibir Banner</p>
                    <p className="text-sm text-netflix-text-muted">
                        Ativar/desativar o banner global
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={banner.enabled}
                        onChange={(e) => setBanner({ ...banner, enabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-netflix-gray-lighter rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                </label>
            </div>

            {/* Popup Mode */}
            <div className="flex items-center justify-between p-4 bg-netflix-gray rounded-lg">
                <div>
                    <p className="font-medium text-white">Exibir como Popup</p>
                    <p className="text-sm text-netflix-text-muted">
                        Mostrar banner em popup ao abrir uma aula (em vez de fixo no topo)
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={banner.show_as_popup}
                        onChange={(e) => setBanner({ ...banner, show_as_popup: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-netflix-gray-lighter rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                </label>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-netflix-text mb-2">
                    Imagem do Banner
                </label>
                <div className="flex gap-4">
                    <div className="w-48 h-24 rounded-lg bg-netflix-gray overflow-hidden flex-shrink-0">
                        {banner.image_url ? (
                            <img
                                src={banner.image_url}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-netflix-text-muted" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImage}
                            className="hidden"
                            id="banner-upload"
                        />
                        <label
                            htmlFor="banner-upload"
                            className="btn-secondary text-sm cursor-pointer inline-block"
                        >
                            {uploading ? 'Enviando...' : 'Escolher Imagem'}
                        </label>
                        <p className="text-xs text-netflix-text-muted mt-2">
                            Recomendado: 1920x200px (proporção 16:2)
                        </p>
                        {uploadProgress > 0 && (
                            <div className="mt-2 w-full bg-netflix-gray rounded-full h-2">
                                <div
                                    className="bg-netflix-red h-2 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Link URL */}
            <div>
                <label className="block text-sm font-medium text-netflix-text mb-2">
                    Link de Destino (opcional)
                </label>
                <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                    <input
                        type="url"
                        value={banner.link_url}
                        onChange={(e) => setBanner({ ...banner, link_url: e.target.value })}
                        placeholder="https://exemplo.com/oferta"
                        className="input-field !pl-12"
                    />
                </div>
            </div>

            {/* Alt Text */}
            <div>
                <label className="block text-sm font-medium text-netflix-text mb-2">
                    Texto Alternativo
                </label>
                <input
                    type="text"
                    value={banner.alt_text}
                    onChange={(e) => setBanner({ ...banner, alt_text: e.target.value })}
                    placeholder="Descrição da imagem"
                    className="input-field"
                />
            </div>

            {/* Preview */}
            {banner.image_url && (
                <div>
                    <label className="block text-sm font-medium text-netflix-text mb-2">
                        Pré-visualização
                    </label>
                    <div className="rounded-xl overflow-hidden border border-white/10">
                        <img
                            src={banner.image_url}
                            alt={banner.alt_text}
                            className="w-full h-auto object-cover max-h-48"
                        />
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-white/10">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    Salvar Banner
                </button>
            </div>
        </div>
    );
}
