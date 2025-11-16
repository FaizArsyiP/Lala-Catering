import Link from 'next/link';

const AdminSidebar = () => {
    return (
        <div className="w-[250px] bg-white h-full p-6 shadow-lg fixed">
            <h2 className="text-xl font-bold text-[#002683] mb-8">Logo Lala</h2>
            <nav className="flex flex-col gap-4">
                <Link href="/admin" className="text-lg font-medium text-[#002683] hover:text-[#E5713A] flex items-center gap-2">
                    Dashboard
                </Link>
                <Link href="/admin/kelola-pesanan" className="text-lg font-medium text-[#002683] hover:text-[#E5713A] flex items-center gap-2">
                    Kelola Pesanan
                </Link>
                <Link href="/admin/kelola-toko" className="text-lg font-medium text-[#002683] hover:text-[#E5713A] flex items-center gap-2">
                    Kelola Toko
                </Link>
            </nav>
        </div>
    );
};

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#F7F7F7]">
            <AdminSidebar />
            <main className="flex-1 ml-[250px] p-10">
                {children} 
            </main>
        </div>
    );
}