// components/dashboard/PesananList.tsx
"use client";

import { useState, useEffect } from "react";
// Kita ambil tipe data dari hooks yang lu kasih
import { type Order, type OrderItem, type Delivery } from "@/hooks/useOrders";
import { IconUser, IconSearch, IconDish } from "@/components/icons";

interface PesananListProps {
    orders: Order[];
    loading: boolean;
}

export default function PesananList({ orders, loading }: PesananListProps) {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // filterr
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByStatus = orders.filter((o: Order) => {
        if (activeFilter === "All" || activeFilter === "Tanggal") return true;
        return o.status.toLowerCase() === activeFilter.toLowerCase();
    });

    const filteredOrders = filteredByStatus.filter((o: Order) => {
        if (!normalizedQuery) return true;
        const q = normalizedQuery;

        // Search in order basic info
        const matchesBasicInfo =
            o._id.toLowerCase().includes(q) ||
            o.userInfo.nama.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q);

        // Search in items (single-day orders)
        const matchesItems = o.items && o.items.some((it: OrderItem) =>
            it.namaItem.toLowerCase().includes(q)
        );

        // Search in deliveries (multi-day orders)
        const matchesDeliveries = o.deliveries && o.deliveries.some((delivery: Delivery) =>
            delivery.hari.toLowerCase().includes(q) ||
            delivery.items.some((it: OrderItem) =>
                it.namaItem.toLowerCase().includes(q)
            )
        );

        return matchesBasicInfo || matchesItems || matchesDeliveries;
    });

    // pagination
    const totalItems = filteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    // Fix: Kalo totalPages berubah (misal dari filter),
    // pastikan currentPage gak 'nggantung' di halaman yg gak ada
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (currentPage < 1) setCurrentPage(1);
    }, [totalPages, currentPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    if (loading) {
        return <div className="p-10">Loading orders...</div>;
    }

    return (
        <>
            {/* SEARCH BAR (TAB PESANAN) */}
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
                        setItemsPerPage(Number(e.target.value));
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
                Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {endIndex}{" "}
                dari {orders.length} item
            </div>

            {/* TAB AKUN SAYA + LIST PESANAN */}
            <div className="space-y-6">
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
                        Tidak ada pesanan yang cocok dengan pencarian.
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
                                            {o.userInfo?.nama}
                                        </div>
                                        <div className="text-xs text-[#0E3B7A]">
                                            No Pesanan: {o._id}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-md font-bold text-[#0E3B7A]">
                                    {o.status}
                                </div>
                            </header>

                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Check if multi-day order */}
                                    {o.deliveries && o.deliveries.length > 0 ? (
                                        // Multi-day order: flatten all items with day prefix
                                        <>
                                            {o.deliveries.map((delivery: Delivery, deliveryIdx: number) =>
                                                delivery.items.map((it: OrderItem, itemIdx: number) => (
                                                    <div
                                                        key={`${deliveryIdx}-${itemIdx}`}
                                                        className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-3 border-b border-slate-100 text-[#0E3B7A]">
                                                        <div className="col-span-1 flex items-center justify-start">
                                                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                                                                <IconDish />
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1 sm:col-span-6">
                                                            <div className="text-sm font-medium">
                                                                {delivery.hari} - {it.namaItem}
                                                            </div>
                                                        </div>

                                                        <div className="col-span-1 sm:col-span-1 text-center text-sm">
                                                            x{it.jumlah}
                                                        </div>

                                                        <div className="col-span-1 sm:col-span-2 text-right text-sm">
                                                            Rp {it.harga.toLocaleString()}
                                                        </div>

                                                        <div className="col-span-1 sm:col-span-1 text-center text-sm hidden sm:block">
                                                            {delivery.statusDelivery}
                                                        </div>

                                                        <div className="col-span-1 sm:col-span-1 text-right text-sm">
                                                            {o.metodePengambilan}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </>
                                    ) : (
                                        // Single-day order: show items directly
                                        o.items.map((it: OrderItem, idx: number) => (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-3 border-b border-slate-100 text-[#0E3B7A]">
                                                <div className="col-span-1 flex items-center justify-start">
                                                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                                                        <IconDish />
                                                    </div>
                                                </div>

                                                <div className="col-span-1 sm:col-span-6">
                                                    <div className="text-sm font-medium">
                                                        {it.namaItem}
                                                    </div>
                                                </div>

                                                <div className="col-span-1 sm:col-span-1 text-center text-sm">
                                                    x{it.jumlah}
                                                </div>

                                                <div className="col-span-1 sm:col-span-2 text-right text-sm">
                                                    Rp {it.harga.toLocaleString()}
                                                </div>

                                                <div className="col-span-1 sm:col-span-1 text-center text-sm hidden sm:block">
                                                    {o.status}
                                                </div>

                                                <div className="col-span-1 sm:col-span-1 text-right text-sm">
                                                    {o.metodePengambilan}
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <div className="flex items-center justify-end gap-3 mt-2">
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
            </div>

            {/* PAGINATION */}
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-700">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded border hover:bg-slate-100"
                    aria-label="previous page"
                    disabled={currentPage === 1}>
                    &lt;
                </button>

                {/* PAGE NUMBERS */}
                <div className="flex items-center gap-2">
                    {/* ... (Logika pagination IIFE tetep sama) ... */}
                    {(() => {
                        const pages: (number | string)[] = [];
                        if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++)
                                pages.push(i);
                        } else {
                            if (currentPage <= 4) {
                                pages.push(1, 2, 3, 4, 5, "...", totalPages);
                            } else if (currentPage >= totalPages - 3) {
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
                            const active = num === currentPage;
                            return (
                                <button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 rounded border hover:bg-slate-100"
                    aria-label="next page"
                    disabled={currentPage === totalPages}>
                    &gt;
                </button>
            </div>
        </>
    );
}