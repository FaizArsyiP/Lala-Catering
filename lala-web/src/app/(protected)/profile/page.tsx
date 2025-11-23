"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { IconUser } from "@/components/icons";
import PesananList from "@/components/orderList";
import api from "@/utils/axiosInstance";

export default function DashboardProfilePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const needsCompletion = searchParams.get("complete") === "true";

    // State untuk tab
    const [activeTab, setActiveTab] = useState<"pesanan" | "akun">(
        needsCompletion ? "akun" : "pesanan"
    );

    const [isEditing, setIsEditing] = useState(needsCompletion);
    const profile = useProfile();
    const [formData, setFormData] = useState({
        nama: "",
        nomorTelepon: "",
        email: "",
        alamatPengiriman: "",
    });
    const [profileIncomplete, setProfileIncomplete] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                nama: profile.nama ?? "",
                nomorTelepon: profile.nomorTelepon ?? "",
                email: profile.email ?? "",
                alamatPengiriman: profile.alamatPengiriman ?? "",
            });

            // Cek apakah profile masih incomplete
            const incomplete =
                profile.nomorTelepon === "000000000" ||
                profile.alamatPengiriman === "MUST_UPDATE_PROFILE" ||
                !profile.alamatPengiriman;
            setProfileIncomplete(incomplete);
        }
    }, [profile]);

    const handleSave = async () => {
        // Validasi data
        if (!formData.nomorTelepon || formData.nomorTelepon === "000000000") {
            alert("Nomor telepon harus diisi dengan benar!");
            return;
        }
        if (
            !formData.alamatPengiriman ||
            formData.alamatPengiriman === "MUST_UPDATE_PROFILE"
        ) {
            alert("Alamat pengiriman harus diisi!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await api.put(
                `/users/profile`,
                {
                    nama: formData.nama,
                    nomorTelepon: formData.nomorTelepon,
                    alamatPengiriman: formData.alamatPengiriman,
                },
                { headers: { "x-auth-token": token } }
            );

            // Update localStorage dengan data user yang baru
            const updatedUser = response.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("authStateChanged"));

            alert("Profil berhasil diperbarui!");
            setIsEditing(false);
            setProfileIncomplete(false);

            // Jika dari completion flow, redirect ke home
            if (needsCompletion) {
                router.push("/");
            }
        } catch (err) {
            console.error(err);
            alert("Gagal memperbarui profil");
        }
    };
    const handleCancel = () => {
        setIsEditing(false);
        if (profile) {
            setFormData({
                nama: profile.nama,
                nomorTelepon: profile.nomorTelepon,
                email: profile.email,
                alamatPengiriman: profile.alamatPengiriman,
            });
        }
    };
    const { orders, loading } = useOrders("/orders/myorders");

    return (
        <div className="min-h-screen bg-white text-slate-800">
            {!profile ? (
                <div className="p-10">Loading profile...</div>
            ) : (
                <>
                    {/* HEADER */}
                    <div className="w-full items-center bg-[#0E3B7A]">
                        <div className="w-full tablet:w-[90%] lg:w-[80%] mx-auto">
                            <Header />
                        </div>
                    </div>
                    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-6 sm:py-8 md:py-14 flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
                        {/* SIDEBAR + AKUN */}
                        <aside className="w-full md:w-64 lg:w-72 md:flex-shrink-0">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                    <IconUser />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-sm sm:text-base truncate">
                                        {profile.nama}
                                    </div>
                                    <div className="text-xs sm:text-sm text-slate-500 truncate">
                                        {profile.email}
                                    </div>
                                </div>
                            </div>

                            <ul className="flex md:flex-col gap-2 md:gap-0 md:space-y-2">
                                <li
                                    onClick={() => setActiveTab("pesanan")}
                                    className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer flex-1 md:flex-none justify-center md:justify-start text-sm sm:text-base transition-colors ${
                                        activeTab === "pesanan"
                                            ? "bg-[#F8F4F2] text-[#EF6C6C] font-medium"
                                            : "hover:bg-slate-50 text-slate-700"
                                    }`}>
                                    Pesanan Saya
                                </li>
                                <li
                                    onClick={() => setActiveTab("akun")}
                                    className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer flex-1 md:flex-none justify-center md:justify-start text-sm sm:text-base transition-colors ${
                                        activeTab === "akun"
                                            ? "bg-[#F8F4F2] text-[#EF6C6C] font-medium"
                                            : "hover:bg-slate-50 text-slate-700"
                                    }`}>
                                    Akun Saya
                                </li>
                            </ul>
                        </aside>

                        {/* MAIN CONTENT */}
                        <main className="flex-1 w-full md:w-auto">
                            {activeTab === "pesanan" ? (
                                <>
                                    <h1 className="text-xl tablet:text-2xl font-bold text-[#EF6C6C] mb-3">
                                        Pesanan Saya
                                    </h1>
                                    {profileIncomplete && (
                                        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        className="h-5 w-5 text-yellow-400"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-yellow-700">
                                                        <span className="font-semibold">
                                                            Perhatian!
                                                        </span>{" "}
                                                        Silakan lengkapi nomor telepon dan alamat pengiriman Anda di tab{" "}
                                                        <button
                                                            onClick={() =>
                                                                setActiveTab(
                                                                    "akun"
                                                                )
                                                            }
                                                            className="underline font-semibold hover:text-yellow-800">
                                                            Akun Saya
                                                        </button>{" "}
                                                        sebelum melakukan pemesanan.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <PesananList orders={orders} loading={loading} />
                                </>
                            ) : (
                                <>
                                    <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                                        <div>
                                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#EF6C6C]">
                                                Akun Saya
                                            </h1>
                                        </div>
                                        {!isEditing && (
                                            <div className="w-full sm:w-auto">
                                                <button
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#EF6C6C] hover:bg-[#d65555] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-colors font-medium text-sm sm:text-base"
                                                    onClick={() =>
                                                        setIsEditing(true)
                                                    }>
                                                    Edit Profil
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Warning Banner untuk Profile Incomplete */}
                                    {profileIncomplete && (
                                        <div className="mb-3 sm:mb-4 bg-orange-50 border-l-4 border-orange-400 p-3 sm:p-4 rounded">
                                            <div className="flex items-start gap-2 sm:gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <svg
                                                        className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs sm:text-sm text-orange-700">
                                                        <span className="font-semibold">
                                                            Lengkapi Profil Anda!
                                                        </span>{" "}
                                                        Nomor telepon dan alamat pengiriman diperlukan untuk melakukan pemesanan. Silakan isi data di bawah ini.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* FORM 'AKUN SAYA' */}
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="bg-white rounded-lg border-2 border-[#0E3B7A] p-3 sm:p-4 md:p-6 w-full max-w-3xl">
                                            <div className="space-y-3 sm:space-y-4">
                                                {/* Input Nama */}
                                                <div>
                                                    <label className="block text-xs sm:text-sm text-[#0E3B7A] font-medium mb-1 sm:mb-2">
                                                        Nama
                                                    </label>
                                                    <input
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0E3B7A] focus:border-transparent disabled:opacity-60"
                                                        value={formData.nama}
                                                        disabled={!isEditing}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                nama: e.target
                                                                    .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm text-[#0E3B7A] font-medium mb-1 sm:mb-2">
                                                        No Handphone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0E3B7A] focus:border-transparent disabled:opacity-60"
                                                        value={
                                                            formData.nomorTelepon
                                                        }
                                                        disabled={!isEditing}
                                                        placeholder="08123456789"
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                nomorTelepon:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm text-[#0E3B7A] font-medium mb-1 sm:mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                                                        value={formData.email}
                                                        disabled
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm text-[#0E3B7A] font-medium mb-1 sm:mb-2">
                                                        Alamat Pengiriman
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0E3B7A] focus:border-transparent disabled:opacity-60 resize-none"
                                                        value={
                                                            formData.alamatPengiriman
                                                        }
                                                        disabled={!isEditing}
                                                        placeholder="Masukkan alamat lengkap untuk pengiriman"
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                alamatPengiriman:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            {isEditing && (
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                                                    <button
                                                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                                                        onClick={handleSave}>
                                                        Simpan
                                                    </button>
                                                    <button
                                                        className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                                                        onClick={handleCancel}>
                                                        Batal
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </main>
                    </div>
                </>
            )}

            {/* FUTERS
            <footer className="h-20 bg-[#083170]" /> */}
        </div>
    );
}
