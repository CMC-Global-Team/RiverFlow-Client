"use client"

import { ReactNode } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface AdminLayoutProps {
    children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-background">
                <AdminSidebar />
                <div className="flex-1 flex flex-col ml-64">
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
