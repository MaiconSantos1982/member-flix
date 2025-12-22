'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import {
    Search,
    Users,
    UserCheck,
    UserX,
    Mail,
    Clock,
    MoreVertical,
    Plus,
    Trash2,
    BookOpen,
    Loader2,
    ChevronDown,
    X
} from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    enrollments?: { count: number }[];
}

interface Product {
    id: string;
    title: string;
}

export default function AdminAlunosPage() {
    const { success, error: showError } = useToast();
    const [users, setUsers] = useState<Profile[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Buscar usuários
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*, enrollments(count)')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;
            setUsers(usersData || []);

            // Buscar produtos
            const { data: productsData } = await supabase
                .from('products')
                .select('id, title')
                .eq('is_published', true)
                .order('title');

            setProducts(productsData || []);
        } catch (err) {
            console.error('Error:', err);
            showError('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const openEnrollModal = async (user: Profile) => {
        setSelectedUser(user);

        // Buscar matrículas do usuário
        const { data } = await supabase
            .from('enrollments')
            .select('*, products(title)')
            .eq('user_id', user.id);

        setUserEnrollments(data || []);
        setShowEnrollModal(true);
    };

    const addEnrollment = async () => {
        if (!selectedUser || !selectedProduct) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('enrollments')
                .insert({
                    user_id: selectedUser.id,
                    product_id: selectedProduct,
                    active: true,
                });

            if (error) {
                if (error.code === '23505') {
                    showError('Erro', 'Aluno já está matriculado neste curso');
                } else {
                    throw error;
                }
                return;
            }

            success('Matrícula adicionada!');

            // Atualizar lista de matrículas
            const { data } = await supabase
                .from('enrollments')
                .select('*, products(title)')
                .eq('user_id', selectedUser.id);

            setUserEnrollments(data || []);
            setSelectedProduct('');
            fetchData();
        } catch (err: any) {
            showError('Erro', err.message);
        } finally {
            setSaving(false);
        }
    };

    const removeEnrollment = async (enrollmentId: string) => {
        if (!confirm('Remover matrícula?')) return;

        try {
            const { error } = await supabase
                .from('enrollments')
                .delete()
                .eq('id', enrollmentId);

            if (error) throw error;

            success('Matrícula removida!');

            // Atualizar lista
            setUserEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
            fetchData();
        } catch (err: any) {
            showError('Erro', err.message);
        }
    };

    const toggleRole = async (user: Profile) => {
        const newRole = user.role === 'admin' ? 'student' : 'admin';

        if (!confirm(`Alterar role para ${newRole}?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', user.id);

            if (error) throw error;

            success(`Usuário agora é ${newRole}`);
            fetchData();
        } catch (err: any) {
            showError('Erro', err.message);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-netflix-red animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Alunos</h1>
                <p className="text-netflix-text-muted mt-1">
                    {users.length} usuário(s) cadastrado(s)
                </p>
            </header>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome ou email..."
                        className="input-field !pl-12 w-full"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-netflix-dark rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Usuário</th>
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Role</th>
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Matrículas</th>
                                <th className="text-left p-4 text-sm font-semibold text-netflix-text-muted">Cadastro</th>
                                <th className="text-right p-4 text-sm font-semibold text-netflix-text-muted">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-netflix-gray flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-medium text-white">
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.full_name || 'Sem nome'}</p>
                                                <p className="text-sm text-netflix-text-muted">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleRole(user)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${user.role === 'admin'
                                                    ? 'bg-netflix-red/20 text-netflix-red hover:bg-netflix-red/30'
                                                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                }`}
                                        >
                                            {user.role}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-white font-medium">
                                            {user.enrollments?.[0]?.count || 0}
                                        </span>
                                        <span className="text-netflix-text-muted"> curso(s)</span>
                                    </td>
                                    <td className="p-4 text-netflix-text-muted">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEnrollModal(user)}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                Matrículas
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-netflix-text-muted">
                                        {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enrollment Modal */}
            {showEnrollModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowEnrollModal(false)} />
                    <div className="relative bg-netflix-dark rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto border border-white/10">
                        <div className="sticky top-0 bg-netflix-dark p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Matrículas</h2>
                                <p className="text-sm text-netflix-text-muted">
                                    {selectedUser.full_name || selectedUser.email}
                                </p>
                            </div>
                            <button onClick={() => setShowEnrollModal(false)} className="text-netflix-text-muted hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Add Enrollment */}
                            <div className="flex gap-3">
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="input-field flex-1"
                                >
                                    <option value="">Selecione um curso...</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.title}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={addEnrollment}
                                    disabled={!selectedProduct || saving}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Adicionar
                                </button>
                            </div>

                            {/* Current Enrollments */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3">Cursos Matriculados</h3>
                                {userEnrollments.length > 0 ? (
                                    <div className="space-y-2">
                                        {userEnrollments.map((enrollment) => (
                                            <div
                                                key={enrollment.id}
                                                className="flex items-center justify-between p-3 bg-netflix-gray rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <BookOpen className="w-5 h-5 text-netflix-red" />
                                                    <div>
                                                        <p className="text-sm font-medium text-white">
                                                            {enrollment.products?.title}
                                                        </p>
                                                        <p className="text-xs text-netflix-text-muted">
                                                            Desde {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeEnrollment(enrollment.id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-netflix-text-muted text-sm">Nenhuma matrícula ativa</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
