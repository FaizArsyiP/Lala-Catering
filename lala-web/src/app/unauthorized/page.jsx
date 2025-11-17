"use client";

import Link from "next/link";
import { IoAlertCircleOutline } from "react-icons/io5";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-6">
            <IoAlertCircleOutline className="text-red-500" size={80} />

            <h1 className="mt-6 text-3xl font-bold text-gray-800">
                Akses Ditolak
            </h1>

            <p className="mt-2 text-gray-600 text-center max-w-md">
                Kamu tidak memiliki izin untuk mengakses halaman ini.  
                Silakan login ulang atau gunakan akun yang sesuai.
            </p>

            <Link
                href="/"
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
