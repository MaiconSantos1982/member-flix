'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    PlayCircle,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    User,
    Shield,
    Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
    className?: string;
}

const navItems = [
    { icon: Home, label: 'Início', href: '/' },
];

const adminItems = [
    { icon: Shield, label: 'Painel Admin', href: '/admin' },
];

export function Sidebar({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const { profile, signOut } = useAuth();

    const isAdmin = profile?.role === 'admin';

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const NavLink = ({ item }: { item: typeof navItems[0] }) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
            <Link
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group touch-target',
                    isActive
                        ? 'bg-netflix-red text-white'
                        : 'text-netflix-text hover:bg-white/10 hover:text-white'
                )}
            >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-white')} />
                {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {isCollapsed && (
                    <div className="absolute left-16 bg-netflix-dark text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {item.label}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobile}
                className="fixed top-4 left-4 z-50 p-2 bg-netflix-dark rounded-lg lg:hidden touch-target"
                aria-label="Menu"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'sidebar flex flex-col',
                    isCollapsed && 'collapsed',
                    isMobileOpen && 'open',
                    className
                )}
            >
                {/* Header */}
                <div className={cn(
                    'flex items-center h-16 px-4 border-b border-white/5',
                    isCollapsed ? 'justify-center' : 'justify-between'
                )}>
                    {!isCollapsed && (
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-netflix-red rounded-lg flex items-center justify-center">
                                <PlayCircle className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">WeMembers</span>
                        </Link>
                    )}

                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:flex p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        <ChevronLeft className={cn(
                            'w-5 h-5 transition-transform',
                            isCollapsed && 'rotate-180'
                        )} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}

                    {isAdmin && (
                        <>
                            <div className={cn(
                                'px-4 py-2 text-xs font-semibold text-netflix-text-muted uppercase tracking-wider',
                                isCollapsed && 'hidden'
                            )}>
                                Administração
                            </div>
                            {adminItems.map((item) => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </>
                    )}
                </nav>

                {/* Footer / User */}
                <div className="p-3 border-t border-white/5">
                    {profile && (
                        <div className={cn(
                            'flex items-center gap-3 p-3 rounded-lg mb-2',
                            isCollapsed && 'justify-center'
                        )}>
                            <div className="w-10 h-10 bg-netflix-gray-lighter rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-netflix-text" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {profile.full_name || 'Usuário'}
                                    </p>
                                    <p className="text-xs text-netflix-text-muted truncate">
                                        {profile.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Link
                            href="/configuracoes"
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-netflix-text hover:bg-white/10 hover:text-white touch-target',
                                isCollapsed && 'justify-center'
                            )}
                        >
                            <Settings className="w-5 h-5" />
                            {!isCollapsed && <span className="text-sm">Configurações</span>}
                        </Link>

                        <button
                            onClick={() => {
                                signOut();
                                setIsMobileOpen(false);
                            }}
                            className={cn(
                                'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-netflix-text hover:bg-white/10 hover:text-netflix-red touch-target',
                                isCollapsed && 'justify-center'
                            )}
                        >
                            <LogOut className="w-5 h-5" />
                            {!isCollapsed && <span className="text-sm">Sair</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
