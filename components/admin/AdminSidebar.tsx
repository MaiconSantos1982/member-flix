'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Eye,
    PlayCircle,
    Menu,
    X,
} from 'lucide-react';

const menuItems = [
    { href: '/admin', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/admin/produtos', label: 'Gerenciar Produtos', icon: BookOpen },
    { href: '/admin/alunos', label: 'Alunos', icon: Users },
    { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, signOut } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const handleViewAsStudent = () => {
        router.push('/');
    };

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-4 border-b border-white/10">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-netflix-red rounded-lg flex items-center justify-center flex-shrink-0">
                        <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <span className="text-lg font-bold text-white">WeMembers</span>
                            <span className="block text-xs text-netflix-red">Admin</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(item.href)
                                ? 'bg-netflix-red text-white'
                                : 'text-netflix-text hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* View as Student Button */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleViewAsStudent}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all ${collapsed ? 'justify-center' : ''
                        }`}
                >
                    <Eye className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Ver como Aluno</span>}
                </button>
            </div>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-white/10">
                {!collapsed && (
                    <div className="mb-3">
                        <p className="text-sm font-medium text-white truncate">
                            {profile?.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-netflix-text-muted truncate">
                            {profile?.email}
                        </p>
                    </div>
                )}
                <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''
                        }`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Sair</span>}
                </button>
            </div>

            {/* Collapse Button (Desktop) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-netflix-gray border border-white/10 rounded-full items-center justify-center text-netflix-text-muted hover:text-white transition-colors"
            >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
        </>
    );

    return (
        <>
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-netflix-dark border-b border-white/10 flex items-center justify-between px-4 lg:hidden z-50">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-netflix-red rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white">Admin</span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-white"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="fixed top-14 left-0 bottom-0 w-64 bg-netflix-dark border-r border-white/10 z-50 lg:hidden flex flex-col">
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* Desktop Sidebar */}
            <aside
                className={`fixed top-0 left-0 bottom-0 bg-netflix-dark border-r border-white/10 hidden lg:flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Main Content Offset */}
            <div className={`lg:pl-${collapsed ? '20' : '64'}`} />
        </>
    );
}
