"use client";

import { useState, useEffect } from "react";
// Kita ambil tipe data dari hooks yang lu kasih
import { type Order, type DeliveryItem, type Delivery } from "@/hooks/useOrders";
import { IconUser, IconSearch, IconDish } from "@/components/icons";
import api from "@/utils/axiosInstance";

// TypeScript declaration for Midtrans Snap
declare global {
    interface Window {
        snap: any;
    }
}

interface PesananListProps {
    orders: Order[];
    loading: boolean;
    isAdmin?: boolean; // Flag untuk admin/seller view
}

export default function PesananList({ orders, loading, isAdmin = false }: PesananListProps) {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

    // Handler: Bayar sekarang dengan Midtrans (pending → paid)
    const handlePayNow = async (orderId: string) => {
        try {
            setProcessingOrderId(orderId);
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                setProcessingOrderId(null);
                return;
            }

            // Get payment token from Midtrans
            const checkoutResponse = await api.post(
                `/orders/${orderId}/checkout`,
                {},
                { headers: { "x-auth-token": token } }
            );

            const snapToken = checkoutResponse.data.token;

            // Check if Midtrans Snap is loaded
            if (!window.snap) {
                alert("Sistem pembayaran sedang dimuat. Mohon refresh halaman dan coba lagi.");
                setProcessingOrderId(null);
                return;
            }

            // Function untuk update status ke 'paid' (karena callback gak bisa masuk di localhost)
            const updateStatusToPaid = async () => {
                try {
                    await api.post(
                        `/orders/${orderId}/test-status`,
                        { status: "paid" },
                        { headers: { "x-auth-token": token } }
                    );
                    console.log("Status updated to paid");
                } catch (err) {
                    console.error("Failed to update status:", err);
                }
            };

            // Show Midtrans popup
            window.snap.pay(snapToken, {
                onSuccess: async function (result) {
                    console.log("Payment success:", result);
                    alert("Pembayaran berhasil!");
                    // Update status karena callback tidak bisa masuk di localhost
                    await updateStatusToPaid();
                    window.location.reload();
                },
                onPending: async function (result) {
                    console.log("Payment pending:", result);
                    alert("Menunggu pembayaran...");
                    // Update status karena callback tidak bisa masuk di localhost
                    await updateStatusToPaid();
                    window.location.reload();
                },
                onError: function (result) {
                    console.error("Payment error:", result);
                    alert("Pembayaran gagal! Silakan coba lagi.");
                    setProcessingOrderId(null);
                },
                onClose: function () {
                    console.log("Payment popup closed");
                    setProcessingOrderId(null);
                },
            });
        } catch (err: any) {
            console.error("Payment error:", err);
            alert(err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran");
            setProcessingOrderId(null);
        }
    };

    // Handler: Mark ready (confirmed → ready) - ADMIN ONLY
    const handleMarkReady = async (orderId: string) => {
        if (!confirm("Tandai pesanan ini sebagai siap diambil/dikirim?")) {
            return;
        }

        try {
            setProcessingOrderId(orderId);
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                return;
            }

            // Call endpoint ready
            await api.post(
                `/orders/${orderId}/ready`,
                {},
                { headers: { "x-auth-token": token } }
            );

            alert("Pesanan berhasil ditandai ready!");
            window.location.reload();
        } catch (err: any) {
            console.error("Mark ready error:", err);
            alert(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Handler: Tandai selesai (ready → completed)
    const handleMarkComplete = async (orderId: string) => {
        if (!confirm("Konfirmasi pesanan sudah diterima?")) {
            return;
        }

        try {
            setProcessingOrderId(orderId);
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                return;
            }

            // Call endpoint complete
            await api.post(
                `/orders/${orderId}/complete`,
                {},
                { headers: { "x-auth-token": token } }
            );

            alert("Pesanan berhasil ditandai selesai!");
            window.location.reload();
        } catch (err: any) {
            console.error("Complete order error:", err);
            alert(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Handler: Accept order (paid → confirmed) - ADMIN ONLY
    const handleAcceptOrder = async (orderId: string) => {
        if (!confirm("Terima pesanan ini?")) {
            return;
        }

        try {
            setProcessingOrderId(orderId);
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                return;
            }

            // Call endpoint approve
            await api.post(
                `/orders/${orderId}/approve`,
                {},
                { headers: { "x-auth-token": token } }
            );

            alert("Pesanan berhasil diterima!");
            window.location.reload();
        } catch (err: any) {
            console.error("Approve order error:", err);
            alert(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Handler: Reject order (paid → canceled + refund) - ADMIN ONLY
    const handleRejectOrder = async (orderId: string) => {
        const reason = prompt("Alasan penolakan pesanan:");
        if (!reason) {
            return;
        }

        try {
            setProcessingOrderId(orderId);
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                return;
            }

            // Call endpoint reject
            await api.post(
                `/orders/${orderId}/reject`,
                { reason },
                { headers: { "x-auth-token": token } }
            );

            alert("Pesanan ditolak dan refund akan diproses.");
            window.location.reload();
        } catch (err: any) {
            console.error("Reject order error:", err);
            alert(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setProcessingOrderId(null);
        }
    };

    // filterr
    const normalizedQuery = query.trim().toLowerCase();
    const filteredByStatus = orders.filter((o: Order) => {
        if (activeFilter === "All" || activeFilter === "Tanggal") return true;
        return o.status.toLowerCase() === activeFilter.toLowerCase();
    });

    const filteredOrders = filteredByStatus.filter((o: Order) => {
        if (!normalizedQuery) return true;
        const q = normalizedQuery;

        // Basic info
        const matchesBasicInfo =
            o._id.toLowerCase().includes(q) ||
            o.userInfo.nama.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q);

        // Search inside deliveries (both single & multi day)
        const matchesDeliveries = o.deliveries?.some(
            (delivery: Delivery) =>
                delivery.hari.toLowerCase().includes(q) ||
                delivery.items.some((it) =>
                    it.namaItem.toLowerCase().includes(q)
                )
        );

        return matchesBasicInfo || matchesDeliveries;
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
                        className="pl-10 pr-4 py-2 rounded-full border border-slate-200 w-full text-[#0E3B7A]"
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
                    "Ready",
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
                                            {o.deliveries.map(
                                                (
                                                    delivery: Delivery,
                                                    deliveryIdx: number
                                                ) =>
                                                    delivery.items.map(
                                                        (
                                                            it: DeliveryItem,
                                                            itemIdx: number
                                                        ) => (
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
                                                                        {
                                                                            delivery.hari
                                                                        }{" "}
                                                                        -{" "}
                                                                        {
                                                                            it.namaItem
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div className="col-span-1 sm:col-span-1 text-center text-sm">
                                                                    x{it.jumlah}
                                                                </div>

                                                                <div className="col-span-1 sm:col-span-2 text-right text-sm">
                                                                    Rp{" "}
                                                                    {it.harga.toLocaleString()}
                                                                </div>

                                                                <div className="col-span-1 sm:col-span-1 text-center text-sm hidden sm:block">
                                                                    {
                                                                        delivery.statusDelivery
                                                                    }
                                                                </div>

                                                                <div className="col-span-1 sm:col-span-1 text-right text-sm">
                                                                    {
                                                                        o.metodePengambilan
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                            )}
                                        </>
                                    ) : (
                                        // Single-day order: show items directly
                                        o.deliveries[0].items.map(
                                            (it: DeliveryItem, idx: number) => (
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
                                                        Rp{" "}
                                                        {it.harga.toLocaleString()}
                                                    </div>

                                                    <div className="col-span-1 sm:col-span-1 text-center text-sm hidden sm:block">
                                                        {o.status}
                                                    </div>

                                                    <div className="col-span-1 sm:col-span-1 text-right text-sm">
                                                        {o.metodePengambilan}
                                                    </div>
                                                </div>
                                            )
                                        )
                                    )}

                                    <div className="flex items-center justify-end gap-3 mt-2">
                                        <button className="px-3 py-1 border rounded text-sm cursor-pointer hover:bg-gray-50">
                                            Lihat detail
                                        </button>

                                        {/* CUSTOMER VIEW - Tombol untuk pembeli */}
                                        {!isAdmin && (
                                            <>
                                                {/* Tombol Bayar Sekarang - untuk status pending */}
                                                {o.status.toLowerCase() === 'pending' && (
                                                    <button
                                                        onClick={() => handlePayNow(o._id)}
                                                        disabled={processingOrderId === o._id}
                                                        className="px-3 py-1 bg-[#EF6C6C] text-white rounded text-sm cursor-pointer hover:bg-[#d65555] disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {processingOrderId === o._id ? 'Memproses...' : 'Bayar Sekarang'}
                                                    </button>
                                                )}

                                                {/* Tombol Tandai Selesai - untuk status ready */}
                                                {o.status.toLowerCase() === 'ready' && (
                                                    <button
                                                        onClick={() => handleMarkComplete(o._id)}
                                                        disabled={processingOrderId === o._id}
                                                        className="px-3 py-1 bg-green-600 text-white rounded text-sm cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {processingOrderId === o._id ? 'Memproses...' : 'Konfirmasi Terima'}
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* ADMIN VIEW - Tombol untuk seller/admin */}
                                        {isAdmin && (
                                            <>
                                                {/* Tombol Accept & Reject - untuk status paid */}
                                                {o.status.toLowerCase() === 'paid' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptOrder(o._id)}
                                                            disabled={processingOrderId === o._id}
                                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                                            {processingOrderId === o._id ? 'Memproses...' : 'Accept'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectOrder(o._id)}
                                                            disabled={processingOrderId === o._id}
                                                            className="px-3 py-1 bg-red-600 text-white rounded text-sm cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                                            {processingOrderId === o._id ? 'Memproses...' : 'Reject'}
                                                        </button>
                                                    </>
                                                )}

                                                {/* Tombol Mark Ready - untuk status confirmed */}
                                                {o.status.toLowerCase() === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleMarkReady(o._id)}
                                                        disabled={processingOrderId === o._id}
                                                        className="px-4 py-2 bg-[#E07856] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#d16a45] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                                        <svg
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                        {processingOrderId === o._id ? 'Memproses...' : 'Ready'}
                                                    </button>
                                                )}
                                            </>
                                        )}
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
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
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
                    onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="px-2 py-1 rounded border hover:bg-slate-100"
                    aria-label="next page"
                    disabled={currentPage === totalPages}>
                    &gt;
                </button>
            </div>
        </>
    );
}
