"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";
import UserDetailsForm from "@/components/userDetailsForm";
import OrderSumBox from "@/components/orderSumBox";
import api from "@/utils/axiosInstance";

const AdminOrderDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;

    const [userData, setUserData] = useState({
        name: "",
        phone: "",
        email: "",
        deliveryMethod: "",
        address: "",
    });

    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [orderStatus, setOrderStatus] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadInvoice = async () => {
        try {
            setIsDownloading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Sesi Anda telah berakhir. Silakan login kembali.");
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/invoice`, {
                method: 'GET',
                headers: {
                    "x-auth-token": token
                }
            });

            if (!response.ok) {
                throw new Error('Gagal mengunduh invoice');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Error downloading invoice:", err);
            alert("Gagal mengunduh invoice. Silakan coba lagi.");
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await api.get(`/orders/${orderId}`, {
                    headers: { "x-auth-token": token }
                });

                const order = response.data;

                // Set user data
                setUserData({
                    name: order.userInfo.nama,
                    phone: order.userInfo.nomorTelepon,
                    email: order.userInfo.email,
                    deliveryMethod: order.metodePengambilan,
                    address: order.alamatPengirimanText || order.lokasiPengiriman || '',
                });

                // Transform deliveries to cart format
                const cartItems = [];
                order.deliveries.forEach((delivery) => {
                    delivery.items.forEach((item) => {
                        cartItems.push({
                            id: item.menuItemId,
                            name: item.namaItem,
                            price: item.harga,
                            quantity: item.jumlah,
                            day: delivery.hari,
                        });
                    });
                });

                setCart(cartItems);
                setTotalAmount(order.totalHarga);
                setTotalItems(cartItems.reduce((sum, item) => sum + item.quantity, 0));
                setOrderStatus(order.status);
            } catch (err) {
                console.error("Error fetching order:", err);
                setError(err.response?.data?.message || "Gagal memuat detail pesanan");
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId, router]);

    if (isLoading) {
        return (
            <div className="w-full max-w-[1140px] mx-auto px-4">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#E5713A] mx-auto mb-4"></div>
                    <p className="text-xl text-[#5B5B5B] font-medium">Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-[1140px] mx-auto px-4">
                <div className="text-center py-20">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-xl text-red-600 font-medium mb-2">{error}</p>
                    <button
                        onClick={() => router.push("/admin/kelola-pesanan")}
                        className="mt-4 px-6 py-2 bg-[#E5713A] text-white rounded-lg hover:bg-[#d65535]">
                        Kembali ke Kelola Pesanan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1140px] mx-auto px-4">
            <button
                onClick={() => router.push("/admin/kelola-pesanan")}
                className="inline-flex items-center text-[#E5713A] hover:text-[#D46029] font-semibold transition-colors mb-8">
                <IoArrowBackOutline size={24} className="mr-2" />
                Kembali ke Kelola Pesanan
            </button>

            <div className="bg-[#F7F7F7] rounded-[30px] p-8 shadow-lg border-2 border-[#002683]">
                <div className="flex justify-between items-start mb-8">
                    <h1 className="text-[40px] font-bold text-[#002683]">
                        Detail Pesanan
                    </h1>
                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <div className="text-sm text-[#5B5B5B]">Status</div>
                            <div className={`text-xl font-bold uppercase ${
                                orderStatus.toLowerCase() === 'completed' ? 'text-green-600' :
                                orderStatus.toLowerCase() === 'cancelled' ? 'text-red-600' :
                                orderStatus.toLowerCase() === 'pending' ? 'text-yellow-600' :
                                'text-[#E5713A]'
                            }`}>
                                {orderStatus}
                            </div>
                        </div>
                        <button
                            onClick={handleDownloadInvoice}
                            disabled={isDownloading}
                            className="px-6 py-2 bg-[#002683] text-white rounded-lg hover:bg-[#001a5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {isDownloading ? 'Mengunduh...' : 'Download Invoice'}
                        </button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* KIRI - Form Data Diri (60%) - READ ONLY */}
                    <div className="w-[60%]">
                        <h2 className="text-[30px] font-bold text-[#E5713A] mb-6">
                            Data Pemesan
                        </h2>

                        <UserDetailsForm
                            userData={userData}
                            setUserData={setUserData}
                            editable={false}
                        />
                    </div>

                    {/* KANAN - Ringkasan Pesanan (40%) - TANPA TOMBOL */}
                    <div className="w-[40%]">
                        <OrderSumBox
                            cart={cart}
                            totalAmount={totalAmount}
                            totalItems={totalItems}
                            showCheckoutButton={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;
