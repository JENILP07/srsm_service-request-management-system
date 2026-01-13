"use client";

import { useAuth, AppRole } from '@/contexts/AuthContext';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// This component replaces the ProtectedRoute wrapper from React Router
export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, role, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/auth');
        }
    }, [user, isLoading, router]);

    // Role-based redirect logic could go here similar to ProtectedRoute.tsx
    // But for simple layout wrapping, we just check auth

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}
