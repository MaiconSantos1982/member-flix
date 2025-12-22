'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import {
    User,
    Mail,
    Lock,
    Bell,
    Shield,
    Palette,
    LogOut,
    ChevronRight,
    Save,
    Loader2
} from 'lucide-react';

export default function ConfiguracoesPage() {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const menuItems = [
        { id: 'profile', icon: User, label: 'Perfil' },
        { id: 'security', icon: Lock, label: 'Segurança' },
        { id: 'notifications', icon: Bell, label: 'Notificações' },
        { id: 'appearance', icon: Palette, label: 'Aparência' },
        { id: 'privacy', icon: Shield, label: 'Privacidade' },
    ];

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="main-content min-h-screen pb-20">
                {/* Header */}
                <header className="px-4 lg:px-8 py-8 pt-16 lg:pt-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        Configurações
                    </h1>
                    <p className="text-netflix-text-muted">
                        Gerencie suas preferências e informações da conta
                    </p>
                </header>

                <div className="px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Menu Lateral */}
                        <div className="lg:col-span-1">
                            <nav className="bg-netflix-dark rounded-xl border border-white/5 overflow-hidden">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === item.id
                                                ? 'bg-netflix-red text-white'
                                                : 'text-netflix-text hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="flex-1">{item.label}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ))}

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-500 hover:bg-red-500/10 transition-colors border-t border-white/5"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sair da Conta</span>
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-netflix-dark rounded-xl border border-white/5 p-6">
                                {/* Profile Section */}
                                {activeSection === 'profile' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-white">Informações do Perfil</h2>

                                        {/* Avatar */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-netflix-gray-lighter flex items-center justify-center">
                                                <User className="w-10 h-10 text-netflix-text-muted" />
                                            </div>
                                            <div>
                                                <button className="btn-secondary text-sm">
                                                    Alterar Foto
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                                    Nome Completo
                                                </label>
                                                <input
                                                    type="text"
                                                    defaultValue={profile?.full_name || ''}
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    defaultValue={profile?.email || ''}
                                                    disabled
                                                    className="input-field opacity-60"
                                                />
                                            </div>
                                        </div>

                                        <button className="btn-primary flex items-center gap-2">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Salvar Alterações
                                        </button>
                                    </div>
                                )}

                                {/* Security Section */}
                                {activeSection === 'security' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-white">Segurança</h2>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                                    Senha Atual
                                                </label>
                                                <input type="password" className="input-field" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                                    Nova Senha
                                                </label>
                                                <input type="password" className="input-field" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-netflix-text mb-2">
                                                    Confirmar Nova Senha
                                                </label>
                                                <input type="password" className="input-field" />
                                            </div>
                                        </div>

                                        <button className="btn-primary">
                                            Alterar Senha
                                        </button>

                                        <div className="pt-6 border-t border-white/10">
                                            <h3 className="text-lg font-semibold text-white mb-4">Sessões Ativas</h3>
                                            <div className="bg-netflix-gray rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-white font-medium">Este dispositivo</p>
                                                        <p className="text-sm text-netflix-text-muted">Última atividade: Agora</p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">
                                                        Ativo
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Section */}
                                {activeSection === 'notifications' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-white">Notificações</h2>

                                        <div className="space-y-4">
                                            {[
                                                { label: 'Novos cursos', description: 'Receba alertas quando novos cursos forem adicionados' },
                                                { label: 'Atualizações de conteúdo', description: 'Notificações sobre novos módulos e aulas' },
                                                { label: 'Ofertas e promoções', description: 'Descontos e ofertas especiais' },
                                                { label: 'Lembretes de estudo', description: 'Continue sua jornada de aprendizado' },
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-netflix-gray rounded-lg">
                                                    <div>
                                                        <p className="text-white font-medium">{item.label}</p>
                                                        <p className="text-sm text-netflix-text-muted">{item.description}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-netflix-gray-lighter peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Appearance Section */}
                                {activeSection === 'appearance' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-white">Aparência</h2>

                                        <div>
                                            <label className="block text-sm font-medium text-netflix-text mb-4">
                                                Tema
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { id: 'dark', label: 'Escuro', bg: 'bg-black' },
                                                    { id: 'light', label: 'Claro', bg: 'bg-white' },
                                                    { id: 'system', label: 'Sistema', bg: 'bg-gradient-to-r from-black to-white' },
                                                ].map((theme) => (
                                                    <button
                                                        key={theme.id}
                                                        className={`p-4 rounded-lg border-2 transition-colors ${theme.id === 'dark' ? 'border-netflix-red' : 'border-white/10 hover:border-white/30'
                                                            }`}
                                                    >
                                                        <div className={`w-full h-12 rounded ${theme.bg} mb-2`} />
                                                        <p className="text-sm text-white">{theme.label}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Privacy Section */}
                                {activeSection === 'privacy' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-white">Privacidade</h2>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-netflix-gray rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-white font-medium">Ocultar meu progresso</p>
                                                        <p className="text-sm text-netflix-text-muted">Seu progresso não será visível para outros</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-netflix-gray-lighter rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/10">
                                            <h3 className="text-lg font-semibold text-white mb-4">Dados da Conta</h3>
                                            <div className="space-y-3">
                                                <button className="w-full text-left p-4 bg-netflix-gray rounded-lg hover:bg-netflix-gray-light transition-colors">
                                                    <p className="text-white font-medium">Baixar meus dados</p>
                                                    <p className="text-sm text-netflix-text-muted">Exportar todas as informações da sua conta</p>
                                                </button>
                                                <button className="w-full text-left p-4 bg-red-500/10 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors">
                                                    <p className="text-red-500 font-medium">Excluir minha conta</p>
                                                    <p className="text-sm text-red-400/80">Esta ação é irreversível</p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
