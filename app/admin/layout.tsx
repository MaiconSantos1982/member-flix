'use client';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <AdminGuard>
                <div className="min-h-screen bg-black">
                    <AdminSidebar />

                    {/* Main Content */}
                    <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
                        {children}
                    </main>
                </div>
            </AdminGuard>
        </ToastProvider>
    );
}
