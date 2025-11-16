"use client";

import { useState, useEffect } from "react";
import { type Order } from "@/hooks/useOrders";
import { IconUser, IconSearch, IconDish } from "@/components/icons";

export interface PesananListProps {
    order: Order | null;
    loading: boolean;
}

export default function PesananList({ order, loading }: PesananListProps) {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // Convert struktur /myorder -> list item yang bisa di-render
    const deliveryItems =
        order?.deliveries.flatMap((d) =>
            d.items.map((it) => ({
                ...it,
                hari: d.hari,
                tanggalPengiriman: d.tanggalPengiriman,
                statusDelivery: d.statusDelivery,
            }))
        ) ?? [];

    // filterr
    const normalizedQuery = query.trim().toLowerCase();

    const filteredByStatus = deliveryItems.filter((it) => {
        if (activeFilter === "All" || activeFilter === "Tanggal") return true;
        return it.statusDelivery?.toLowerCase() === activeFilter.toLowerCase();
    });

    const filteredItems = filteredByStatus.filter((it) => {
        if (!normalizedQuery) return true;

        const q = normalizedQuery;
        return (
            it.namaItem.toLowerCase().includes(q) ||
            it.hari.toLowerCase().includes(q) ||
            it.statusDelivery.toLowerCase().includes(q)
        );
    });

    // pagination
    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const paginated = filteredItems.slice(startIndex, endIndex);

    if (loading) return <div className="p-10">Loading...</div>;
    if (!order) return <div className="p-10">Tidak ada pesanan.</div>;

    return (
        <>
            {/* SEARCH BAR */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Cari item, hari, status..."
                        className="pl-10 pr-4 py-2 rounded-full border border-slate-200 w-full"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <IconSearch />
                    </div>
                </div>
            </div>

            {/* FILTER STATUS */}
            <div className="flex flex-wrap gap-3 mb-3">
                {["Tanggal", "All", "pending", "delivered", "failed"].map(
                    (t) => {
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
                                        : "border-[#F2B8A6] text-[#EF6C6C] hover:bg-[#FCEDE8]"
                                }`}>
                                {t}
                            </button>
                        );
                    }
                )}
            </div>

            <div className="text-sm text-slate-500 mb-6">
                Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {endIndex}{" "}
                dari {deliveryItems.length} item
            </div>

            {/* LIST ORDER ITEMS */}
            <div className="space-y-6">
                {paginated.map((it, idx) => (
                    <article
                        key={idx}
                        className="bg-white shadow rounded-xl border border-slate-100">
                        <header className="px-6 py-3 bg-[#c9c9c9] text-white rounded-t-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                    <IconUser />
                                </div>
                                <div>
                                    <div className="text-sm text-[#0E3B7A] font-semibold">
                                        {order.userInfo.nama}
                                    </div>
                                    <div className="text-xs text-[#0E3B7A]">
                                        Hari: {it.hari}
                                    </div>
                                </div>
                            </div>
                            <div className="text-md font-bold text-[#0E3B7A]">
                                {it.statusDelivery}
                            </div>
                        </header>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-3 text-[#0E3B7A]">
                                <div className="col-span-1 flex items-center">
                                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                                        <IconDish />
                                    </div>
                                </div>

                                <div className="col-span-6 text-sm font-medium">
                                    {it.namaItem}
                                </div>

                                <div className="col-span-1 text-center text-sm">
                                    x{it.jumlah}
                                </div>

                                <div className="col-span-2 text-right text-sm">
                                    Rp {it.harga.toLocaleString("id-ID")}
                                </div>

                                <div className="col-span-2 text-right text-sm">
                                    {order.metodePengambilan}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
