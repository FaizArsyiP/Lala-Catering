"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { IconUser } from "@/components/icons";
import PesananList from "@/components/orderList";
import api from "@/utils/axiosInstance";

export default function DashboardProfilePage() {
    // State untuk tab
    const [activeTab, setActiveTab] = useState<"pesanan" | "akun">("pesanan");

    const [isEditing, setIsEditing] = useState(false);
    const profile = useProfile();
    const [formData, setFormData] = useState({
        nama: "",
        nomorTelepon: "",
        email: "",
        alamatPengiriman: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                nama: profile.nama ?? "",
                nomorTelepon: profile.nomorTelepon ?? "",
                email: profile.email ?? "",
                alamatPengiriman: profile.alamatPengiriman ?? "",
            });
        }
    }, [profile]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            await api.put(
                `/users/profile`,
                {
                    nama: formData.nama,
                    nomorTelepon: formData.nomorTelepon,
                    alamatPengiriman: formData.alamatPengiriman,
                },
                { headers: { "x-auth-token": token } }
            );
            alert("Profil berhasil diperbarui!");
            setIsEditing(false);
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
    const { order, loading } = useOrders("/orders/myorder");

    return (
        <div className="min-h-screen bg-white text-slate-800">
            {!profile ? (
                <div className="p-10">Loading profile...</div>
            ) : (
                <>
                    {/* HEADER */}
                    <div className="w-full items-center bg-[#0E3B7A]">
                        <div className="w-[80%] mx-auto">
                            <Header />
                        </div>
                    </div>
                    <div className="max-w-3/4 mx-auto px-10 py-14 flex gap-8">
                        {/* SIDEBAR + AKUN */}
                        <aside className="w-88">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                    <IconUser /> {/* <-- Udah pake komponen */}
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        {profile.nama}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {profile.email}
                                    </div>
                                </div>
                            </div>

                            <ul className="space-y-2">
                                <li
                                    onClick={() => setActiveTab("pesanan")}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                        activeTab === "pesanan"
                                            ? "bg-[#F8F4F2] text-[#EF6C6C]"
                                            : "hover:bg-slate-50"
                                    }`}>
                                    Pesanan Saya
                                </li>
                                <li
                                    onClick={() => setActiveTab("akun")}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                        activeTab === "akun"
                                            ? "bg-[#F8F4F2] text-[#EF6C6C]"
                                            : "hover:bg-slate-50"
                                    }`}>
                                    Akun Saya
                                </li>
                            </ul>
                        </aside>

                        {/* MAIN CONTENT */}
                        <main className="flex-1">
                            {activeTab === "pesanan" ? (
                                <>
                                    <h1 className="text-2xl font-bold text-[#EF6C6C] mb-3">
                                        Pesanan Saya
                                    </h1>
                                    <PesananList order={order} loading={loading} />;
                                </>
                            ) : (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-[#EF6C6C]">
                                                Akun Saya
                                            </h1>
                                        </div>
                                        {!isEditing && (
                                            <div>
                                                <button
                                                    className="flex items-center gap-2 bg-[#EF6C6C] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#d65555]"
                                                    onClick={() =>
                                                        setIsEditing(true)
                                                    }>
                                                    Edit Profile
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* FORM 'AKUN SAYA' */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-lg border-2 border-[#0E3B7A] p-6 max-w-3xl">
                                            <div className="space-y-4">
                                                {/* Input Nama */}
                                                <div>
                                                    <label className="text-sm text-[#0E3B7A] font-medium">
                                                        Nama
                                                    </label>
                                                    <input
                                                        className="w-full mt-2 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50"
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
                                                    <label className="text-sm text-[#0E3B7A] font-medium">
                                                        No Handphone
                                                    </label>
                                                    <input
                                                        className="w-full mt-2 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50"
                                                        value={
                                                            formData.nomorTelepon
                                                        }
                                                        disabled={!isEditing}
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
                                                    <label className="text-sm text-[#0E3B7A] font-medium">
                                                        Email
                                                    </label>
                                                    <input
                                                        className="w-full mt-2 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50"
                                                        value={formData.email}
                                                        disabled
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-[#0E3B7A] font-medium">
                                                        Alamat
                                                    </label>
                                                    <input
                                                        className="w-full mt-2 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50"
                                                        value={
                                                            formData.alamatPengiriman
                                                        }
                                                        disabled={!isEditing}
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
                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                                        onClick={handleSave}>
                                                        Save
                                                    </button>
                                                    <button
                                                        className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                                                        onClick={handleCancel}>
                                                        Cancel
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
