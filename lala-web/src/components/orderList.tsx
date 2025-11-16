"use client";

import { useState, useEffect } from "react";
import { type Order } from "@/hooks/useOrders";
import { IconUser, IconSearch, IconDish } from "@/components/icons";

export interface PesananListProps {
    orders: Order[];
    loading: boolean;
}

export default function PesananList({ orders, loading }: PesananListProps) {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    if (loading) return <div className="p-10">Loading...</div>;
    if (!orders || orders.length === 0) return <div className="p-10">Tidak ada pesanan.</div>;

    // Filter orders based on search and status
    const normalizedQuery = query.trim().toLowerCase();

    const filteredOrders = orders.filter((order) => {
        // Filter by status
        if (activeFilter !== "All" && activeFilter !== "Tanggal") {
            const hasMatchingStatus = order.deliveries?.some(
                (d) => d.statusDelivery?.toLowerCase() === activeFilter.toLowerCase()
            );
            if (!hasMatchingStatus && order.status.toLowerCase() !== activeFilter.toLowerCase()) {
                return false;
            }
        }

        // Filter by search query
        if (normalizedQuery) {
            const matchesOrder =
                order._id.toLowerCase().includes(normalizedQuery) ||
                order.status.toLowerCase().includes(normalizedQuery) ||
                order.userInfo.nama.toLowerCase().includes(normalizedQuery);

            const matchesItems = order.deliveries?.some((d) =>
                d.items.some(
                    (it) =>
                        it.namaItem.toLowerCase().includes(normalizedQuery) ||
                        d.hari.toLowerCase().includes(normalizedQuery)
                )
            );

            if (!matchesOrder && !matchesItems) {
                return false;
            }
        }

        return true;
    });

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
                Menampilkan {filteredOrders.length} pesanan
            </div>

            {/* LIST ORDERS - Grouped by Order */}
            <div className="space-y-8">
                {filteredOrders.map((order) => (
                    <div
                        key={order._id}
                        className="bg-white shadow-lg rounded-xl border-2 border-[#0E3B7A]">
                        {/* ORDER HEADER */}
                        <div className="px-6 py-4 bg-[#0E3B7A] text-white rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <IconUser />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">
                                            {order.userInfo.nama}
                                        </div>
                                        <div className="text-xs opacity-90">
                                            Order ID: {order._id.slice(-8)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">
                                        Rp {order.totalHarga.toLocaleString("id-ID")}
                                    </div>
                                    <div className="text-xs opacity-90">
                                        {new Date(order.tanggalPesanan).toLocaleDateString("id-ID")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ORDER ITEMS */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {order.deliveries?.map((delivery) =>
                                    delivery.items.map((item, itemIdx) => (
                                        <div
                                            key={`${delivery._id}-${itemIdx}`}
                                            className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-3 border-b border-slate-100 text-[#0E3B7A]">
                                            <div className="col-span-1 flex items-center">
                                                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                                                    <IconDish />
                                                </div>
                                            </div>

                                            <div className="col-span-6 text-sm font-medium">
                                                {delivery.hari} - {item.namaItem}
                                            </div>

                                            <div className="col-span-1 text-center text-sm">
                                                x{item.jumlah}
                                            </div>

                                            <div className="col-span-2 text-right text-sm">
                                                Rp {item.harga.toLocaleString("id-ID")}
                                            </div>

                                            <div className="col-span-2 text-center text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        delivery.statusDelivery === "delivered"
                                                            ? "bg-green-100 text-green-700"
                                                            : delivery.statusDelivery === "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {delivery.statusDelivery}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* ORDER FOOTER */}
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                <div className="text-sm text-[#0E3B7A]">
                                    <span className="font-semibold">Metode: </span>
                                    {order.metodePengambilan}
                                </div>
                                <div className="text-sm">
                                    <span
                                        className={`px-3 py-1 rounded-full font-semibold ${
                                            order.status === "completed"
                                                ? "bg-green-100 text-green-700"
                                                : order.status === "paid"
                                                ? "bg-blue-100 text-blue-700"
                                                : order.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                        }`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
