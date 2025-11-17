import Link from 'next/link';
import Image from "next/image"

const AdminSidebar = () => {
    return (
        // Sidebar Container
        <div className="w-[250px] bg-white h-full">
            <div className="relative w-60 h-18 mb-8 pb-4">
                <Image
                    src="/assets/header/logo.svg"
                    alt="Lala Catering Logo"
                    fill
                    className="object-contain object-center"
                />
            </div>
            
            <nav className="flex flex-col gap-[30px]">
                <Link href="/admin" className="group">
                    <div className="flex items-center gap-[20px] text-[24px] font-semibold text-[#002683] group-hover:text-[#E5713A] transition">
                        <div className="relative w-[40px] h-[40px]">
                            <Image
                                src="/assets/admin/sidebar/home-normal.svg"
                                alt="Dashboard Icon"
                                fill
                                className="object-contain opacity-100 group-hover:opacity-0 transition"
                            />

                            <Image
                                src="/assets/admin/sidebar/home-hover.svg"
                                alt="Dashboard Active Icon"
                                fill
                                className="object-contain absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition"
                            />
                        </div>

                        <span>Dashboard</span>
                    </div>
                </Link>

                <Link href="/admin/kelola-pesanan" className="group">
                    <div className="flex items-center gap-[20px] text-[24px] font-semibold text-[#002683] group-hover:text-[#E5713A] transition">
                        <div className="relative w-[40px] h-[40px]">
                            <Image
                                src="/assets/admin/sidebar/order-normal.svg"
                                alt="Dashboard Icon"
                                fill
                                className="object-contain opacity-100 group-hover:opacity-0 transition"
                            />

                            <Image
                                src="/assets/admin/sidebar/order-hover.svg"
                                alt="Dashboard Active Icon"
                                fill
                                className="object-contain absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition"
                            />
                        </div>

                        <span>Kelola Pesanan</span>
                    </div>
                </Link>
                <Link href="/admin/kelola-toko" className="group">
                    <div className="flex items-center gap-[20px] text-[24px] font-semibold text-[#002683] group-hover:text-[#E5713A] transition">
                        <div className="relative w-[40px] h-[40px]">
                            <Image
                                src="/assets/admin/sidebar/store-normal.svg"
                                alt="Dashboard Icon"
                                fill
                                className="object-contain opacity-100 group-hover:opacity-0 transition"
                            />

                            <Image
                                src="/assets/admin/sidebar/store-hover.svg"
                                alt="Dashboard Active Icon"
                                fill
                                className="object-contain absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition"
                            />
                        </div>

                        <span>Kelola Toko</span>
                    </div>
                </Link>
            </nav>
        </div>
    );
};

export default AdminSidebar;