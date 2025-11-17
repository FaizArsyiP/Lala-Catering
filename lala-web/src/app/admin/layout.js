"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/login");
                return;
            }

            if (user.role !== "admin") {
                router.replace("/unauthorized");
                return;
            }
        }
    }, [user, loading]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-white py-10">
            <div className="max-w-[1140px] mx-auto flex gap-[70px]">
                <aside className="w-[250px] flex-shrink-0">
                    <AdminSidebar />
                </aside>
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
