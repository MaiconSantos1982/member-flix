'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { GlobalBannerSettings } from '@/components/admin/GlobalBannerSettings';
import {
    Settings,
    Globe,
    Mail,
    Shield,
    Bell,
    Palette,
    Key,
    Save,
    Loader2,
    CheckCircle,
    Image as ImageIcon
} from 'lucide-react';

export default function AdminConfiguracoesPage() {
    const { success, error: showError } = useToast();
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('general');

    const [settings, setSettings] = useState({
        siteName: 'MemberFlix',
        siteDescription: 'Sua área de membros premium',
        supportEmail: 'suporte@memberflix.com',
        requireEmailConfirmation: true,
        allowRegistration: true,
        enableNotifications: true,
        maintenanceMode: false,
    });

    const handleSave = async () => {
        setSaving(true);

        // Simular salvamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        success('Configurações salvas!');
        setSaving(false);
    };

    const sections = [
        { id: 'general', label: 'Geral', icon: Settings },
        { id: 'banner', label: 'Banner Global', icon: ImageIcon },
        { id: 'auth', label: 'Autenticação', icon: Shield },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'appearance', label: 'Aparência', icon: Palette },
    ];

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Configurações</h1>
                <p className="text-netflix-text-muted mt-1">
                    Gerencie as configurações da plataforma
                </p>
            </header>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="bg-netflix-dark rounded-xl border border-white/5 overflow-hidden">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === section.id
                                    ? 'bg-netflix-red text-white'
                                    : 'text-netflix-text hover:bg-white/5'
                                    }`}
                            >
                                <section.icon className="w-5 h-5" />
                                <span className="font-medium">{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-netflix-dark rounded-xl border border-white/5 p-6">
                        {/* General */}
                        {activeSection === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>

                                <div>
                                    <label className="block text-sm font-medium text-netflix-text mb-2">
                                        Nome da Plataforma
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.siteName}
                                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-netflix-text mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={settings.siteDescription}
                                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                        rows={3}
                                        className="input-field resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-netflix-text mb-2">
                                        Email de Suporte
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-netflix-gray rounded-lg">
                                    <div>
                                        <p className="font-medium text-white">Modo Manutenção</p>
                                        <p className="text-sm text-netflix-text-muted">
                                            Bloquear acesso de alunos temporariamente
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.maintenanceMode}
                                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-netflix-gray-lighter rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Banner Global */}
                        {activeSection === 'banner' && (
                            <GlobalBannerSettings />
                        )}

                        {/* Auth */}
                        {activeSection === 'auth' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white">Autenticação</h2>

                                <div className="flex items-center justify-between p-4 bg-netflix-gray rounded-lg">
                                    <div>
                                        <p className="font-medium text-white">Confirmação de Email</p>
                                        <p className="text-sm text-netflix-text-muted">
                                            Exigir confirmação de email para novos cadastros
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.requireEmailConfirmation}
                                            onChange={(e) => setSettings({ ...settings, requireEmailConfirmation: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-netflix-gray-lighter rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-netflix-gray rounded-lg">
                                    <div>
                                        <p className="font-medium text-white">Permitir Cadastro</p>
                                        <p className="text-sm text-netflix-text-muted">
                                            Novos usuários podem se cadastrar
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.allowRegistration}
                                            onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-netflix-gray-lighter rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                                    </label>
                                </div>

                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Key className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-white">Configurações do Supabase</p>
                                            <p className="text-sm text-netflix-text-muted mt-1">
                                                As configurações de autenticação são gerenciadas no painel do Supabase.
                                                Acesse Authentication → Settings para configurar provedores OAuth, políticas de senha, etc.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeSection === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white">Notificações</h2>

                                <div className="flex items-center justify-between p-4 bg-netflix-gray rounded-lg">
                                    <div>
                                        <p className="font-medium text-white">Notificações por Email</p>
                                        <p className="text-sm text-netflix-text-muted">
                                            Enviar emails automáticos para alunos
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableNotifications}
                                            onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-netflix-gray-lighter rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-white">Eventos de Notificação</h3>
                                    {[
                                        { label: 'Novo cadastro', description: 'Quando um aluno se cadastra' },
                                        { label: 'Nova matrícula', description: 'Quando um aluno é matriculado' },
                                        { label: 'Novo conteúdo', description: 'Quando um módulo é liberado' },
                                        { label: 'Lembrete de estudo', description: 'Lembrar alunos inativos' },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-netflix-gray rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-white">{item.label}</p>
                                                <p className="text-xs text-netflix-text-muted">{item.description}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="w-4 h-4 rounded border-netflix-gray-lighter text-netflix-red focus:ring-netflix-red"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Appearance */}
                        {activeSection === 'appearance' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white">Aparência</h2>

                                <div>
                                    <label className="block text-sm font-medium text-netflix-text mb-4">
                                        Tema
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'dark', label: 'Escuro', color: 'bg-black' },
                                            { id: 'netflix', label: 'Netflix', color: 'bg-netflix-dark' },
                                            { id: 'custom', label: 'Personalizado', color: 'bg-gradient-to-r from-purple-500 to-netflix-red' },
                                        ].map((theme) => (
                                            <button
                                                key={theme.id}
                                                className={`p-4 rounded-lg border-2 transition-colors ${theme.id === 'netflix'
                                                    ? 'border-netflix-red'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                <div className={`w-full h-16 rounded ${theme.color} mb-2`} />
                                                <p className="text-sm text-white">{theme.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-netflix-text mb-2">
                                        Cor Principal
                                    </label>
                                    <div className="flex gap-3">
                                        {['#E50914', '#7C3AED', '#059669', '#0EA5E9', '#F59E0B'].map((color) => (
                                            <button
                                                key={color}
                                                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${color === '#E50914' ? 'border-white' : 'border-transparent'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
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
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
