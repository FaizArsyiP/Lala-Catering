"use client"; 

import AdminSidebar from '@/components/admin/sidebar'; 

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-white py-10">
            
            <div className="max-w-[1140px] mx-auto flex gap-[70px]">
                <aside className="w-[250px] flex-shrink-0">
                    <AdminSidebar />
                </aside>
                
                <main className="flex-1">
                    {children} 
                </main>
            </div>
        </div>
    );
}