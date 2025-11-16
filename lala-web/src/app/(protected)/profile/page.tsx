"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { useProfile } from "@/hooks/useProfile";
import axios from "axios";
import { useOrders, Order, OrderItem } from "@/hooks/useOrders";

export default function DashboardProfilePage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<"pesanan" | "akun">("pesanan");

    const days = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
    ];

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

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
                {
                    nama: formData.nama,
                    nomorTelepon: formData.nomorTelepon,
                    alamatPengiriman: formData.alamatPengiriman,
                },
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );

            alert("Profil berhasil diperbarui!");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Gagal memperbarui profil");
        }
    };

    // sample data pesanan
    const { orders, loadingOrders } = useOrders();

    // simple inline SVG yang gw comot daei w3.org
    const IconUser = ({
        className = "w-5 h-5 text-slate-700",
    }: {
        className?: string;
    }) => (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
                fill="#334155"
            />
            <path
                d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z"
                fill="#94A3B8"
            />
        </svg>
    );

    const IconSearch = ({ className = "w-4 h-4" }: { className?: string }) => (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M21 21l-4.35-4.35"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="11" cy="11" r="6" stroke="#94A3B8" strokeWidth="1.5" />
        </svg>
    );

    const IconDish = ({ className = "w-6 h-6" }: { className?: string }) => (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3 12h18"
                stroke="#64748B"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
            <path
                d="M6 12c0-3 2-5 6-5s6 2 6 5v3H6v-3z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
            />
        </svg>
    );

    // filterr
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByStatus = orders.filter((o: Order) => {
        if (activeFilter === "All" || activeFilter === "Tanggal") return true;
        return o.status.toLowerCase() === activeFilter.toLowerCase();
    });

    const filteredOrders = filteredByStatus.filter((o: Order) => {
        if (!normalizedQuery) return true;

        const q = normalizedQuery;

        return (
            o._id.toLowerCase().includes(q) ||
            o.userInfo.nama.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q) ||
            o.items.some((it: OrderItem) =>
                it.namaItem.toLowerCase().includes(q)
            )
        );
    });

    // pagination
    const totalItems = filteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (currentPage < 1) setCurrentPage(1);
    }, [totalPages]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

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
                                    <IconUser />
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
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#EF6C6C]">
                                        {activeTab === "pesanan"
                                            ? "Pesanan Saya"
                                            : "Akun Saya"}
                                    </h1>
                                </div>
                                {activeTab === "akun" && (
                                    <div>
                                        <button
                                            className="flex items-center gap-2 bg-[#EF6C6C] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#d65555]"
                                            onClick={() => setIsEditing(true)}>
                                            Edit Profile
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* SEARCH BAR (TAB PESANAN) */}
                            {activeTab === "pesanan" && (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="relative flex-1">
                                            <input
                                                value={query}
                                                onChange={(e) => {
                                                    setQuery(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                placeholder="Cari id pesanan, nama, status, atau item..."
                                                className="pl-10 pr-4 py-2 rounded-full border border-slate-200 w-full"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <IconSearch />
                                            </div>
                                        </div>
                                        <select
                                            className="border rounded px-3 py-2 text-sm"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(
                                                    Number(e.target.value)
                                                );
                                                setCurrentPage(1);
                                            }}>
                                            <option value={3}>3</option>
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                        </select>
                                    </div>

                                    {/* FILTER (PESANAN) */}
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {[
                                            "Tanggal",
                                            "All",
                                            "Pending",
                                            "Paid",
                                            "Confirmed",
                                            "Complete",
                                            "Cancelled",
                                        ].map((t) => {
                                            const active = t === activeFilter;
                                            return (
                                                <button
                                                    key={t}
                                                    onClick={() => {
                                                        setActiveFilter(t);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`px-3 py-1 rounded-full border text-sm ${
                                                        active
                                                            ? "bg-[#FCEDE8] border-[#F2B8A6] text-[#EF6C6C]"
                                                            : "border-[#F2B8A6] text-[#EF6C6C] cursor-pointer hover:bg-[#FCEDE8]"
                                                    }`}>
                                                    {t}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="text-sm text-slate-500 mb-6">
                                        Menampilkan{" "}
                                        {totalItems === 0 ? 0 : startIndex + 1}{" "}
                                        - {endIndex} dari {orders.length} item
                                    </div>
                                </>
                            )}

                            {/* TAB AKUN SAYA + LIST PESANAN */}
                            <div className="space-y-6">
                                {activeTab === "akun" ? (
                                    <div className="bg-white rounded-lg border-2 border-[#0E3B7A] p-6 max-w-3xl">
                                        <div className="space-y-4">
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
                                                                e.target.value,
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
                                                                e.target.value,
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
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setFormData({
                                                            nama: profile.nama,
                                                            nomorTelepon:
                                                                profile.nomorTelepon,
                                                            email: profile.email,
                                                            alamatPengiriman:
                                                                profile.alamatPengiriman,
                                                        });
                                                    }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <header className="px-6 py-3 h-[4vh] bg-[#0E3B7A] text-white rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3 ml-8">
                                                <div className="col-span-1 sm:col-span-6 text-sm font-medium">
                                                    Produk
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 ">
                                                <div className=" col-span-1 text-right mr-6 text-sm">
                                                    Harga
                                                </div>

                                                <div className="col-span-1 sm:col-span-1 text-center text-sm">
                                                    Status
                                                </div>

                                                <div className="col-span-1 sm:col-span-1 text-right text-sm">
                                                    Metode Kirim
                                                </div>
                                            </div>
                                        </header>
                                        {totalItems === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                Tidak ada pesanan yang cocok
                                                dengan pencarian.
                                            </div>
                                        ) : (
                                            paginatedOrders.map((o: Order) => (
                                                <article
                                                    key={o._id}
                                                    className="bg-white shadow rounded-xl border border-slate-100">
                                                    <header className="px-6 py-3 bg-[#c9c9c9] text-white rounded-t-lg flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                                <IconUser />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm text-[#0E3B7A] font-semibold">
                                                                    {
                                                                        o
                                                                            .userInfo
                                                                            ?.nama
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-[#0E3B7A]">
                                                                    No Pesanan:{" "}
                                                                    {o._id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-md font-bold text-[#0E3B7A]">
                                                            {o.status}
                                                        </div>
                                                    </header>

                                                    <div className="p-6">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {o.items.map(
                                                                (
                                                                    it: OrderItem,
                                                                    idx: number
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-3 border-b border-slate-100">
                                                                        <div className="col-span-1 flex items-center justify-start">
                                                                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                                                                                <IconDish />
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-span-1 sm:col-span-6">
                                                                            <div className="text-sm font-medium">
                                                                                {
                                                                                    it.namaItem
                                                                                }
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-span-1 sm:col-span-1 text-center text-sm">
                                                                            x
                                                                            {
                                                                                it.jumlah
                                                                            }
                                                                        </div>

                                                                        <div className="col-span-1 sm:col-span-2 text-right text-sm">
                                                                            Rp{" "}
                                                                            {it.harga.toLocaleString()}
                                                                        </div>

                                                                        <div className="col-span-1 sm:col-span-1 text-center text-sm hidden sm:block">
                                                                            {
                                                                                o.status
                                                                            }
                                                                        </div>

                                                                        <div className="col-span-1 sm:col-span-1 text-right text-sm">
                                                                            {
                                                                                o.metodePengambilan
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}

                                                            <div className="flex items-center justify-end gap-3">
                                                                <button className="px-3 py-1 border rounded text-sm cursor-pointer">
                                                                    Lihat detail
                                                                </button>
                                                                <button className="px-3 py-1 bg-[#EF6C6C] text-white rounded text-sm cursor-pointer">
                                                                    Aksi
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>

                            {/* PAGINATION */}
                            {activeTab === "pesanan" && (
                                <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-700">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.max(1, p - 1)
                                            )
                                        }
                                        className="px-2 py-1 rounded border hover:bg-slate-100"
                                        aria-label="previous page"
                                        disabled={currentPage === 1}>
                                        &lt;
                                    </button>

                                    {/* PAGE NUMBERS */}

                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const pages: (number | string)[] =
                                                [];
                                            if (totalPages <= 7) {
                                                for (
                                                    let i = 1;
                                                    i <= totalPages;
                                                    i++
                                                )
                                                    pages.push(i);
                                            } else {
                                                if (currentPage <= 4) {
                                                    pages.push(
                                                        1,
                                                        2,
                                                        3,
                                                        4,
                                                        5,
                                                        "...",
                                                        totalPages
                                                    );
                                                } else if (
                                                    currentPage >=
                                                    totalPages - 3
                                                ) {
                                                    pages.push(
                                                        1,
                                                        "...",
                                                        totalPages - 4,
                                                        totalPages - 3,
                                                        totalPages - 2,
                                                        totalPages - 1,
                                                        totalPages
                                                    );
                                                } else {
                                                    pages.push(
                                                        1,
                                                        "...",
                                                        currentPage - 1,
                                                        currentPage,
                                                        currentPage + 1,
                                                        "...",
                                                        totalPages
                                                    );
                                                }
                                            }

                                            return pages.map((p, idx) => {
                                                if (p === "...")
                                                    return (
                                                        <span
                                                            key={`e-${idx}`}
                                                            className="px-2 text-slate-400">
                                                            ...
                                                        </span>
                                                    );
                                                const num = Number(p);
                                                const active =
                                                    num === currentPage;
                                                return (
                                                    <button
                                                        key={num}
                                                        onClick={() =>
                                                            setCurrentPage(num)
                                                        }
                                                        className={`px-3 py-1 rounded ${
                                                            active
                                                                ? "bg-[#0E3B7A] text-white"
                                                                : "border hover:bg-slate-50"
                                                        }`}>
                                                        {num}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        className="px-2 py-1 rounded border hover:bg-slate-100"
                                        aria-label="next page"
                                        disabled={currentPage === totalPages}>
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </>
            )}

            {/* FUTERS */}
            <footer className="h-20 bg-[#083170]" />
        </div>
    );
}