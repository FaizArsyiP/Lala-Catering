"use client";

import React, { useState, useEffect } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Header from "@/components/layout/header";
import OrderSumBox from "@/components/orderSumBox";
import UserDetailsForm from "@/components/userDetailsForm";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import api from "@/utils/axiosInstance";

const KonfirmasiPesananPage = () => {
    const router = useRouter();
    const { cart, getTotal, totalItems, clearCart } = useCart();

    const [userData, setUserData] = useState({
        name: "",
        phone: "",
        email: "",
        deliveryMethod: "",
        address: "",
        paymentMethod: "",
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const profile = useProfile();

    useEffect(() => {
        if (profile) {
            setUserData((prev) => ({
                ...prev,
                name: profile.nama ?? "",
                phone: profile.nomorTelepon ?? "",
                email: profile.email ?? "",
                address: profile.alamatPengiriman ?? "",
            }));
        }
    }, [profile]);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert("Keranjang Anda kosong!");
            return;
        }
        if (
            !userData.name ||
            !userData.phone ||
            !userData.email ||
            !userData.address
        ) {
            alert("Mohon lengkapi semua data!");
            return;
        }

        setIsProcessing(true);

        try {
            const token = localStorage.getItem("token");

            // Format data: kelompokkan cart berdasarkan hari
            const deliveriesMap = {};
            cart.forEach((item) => {
                if (!deliveriesMap[item.day]) {
                    deliveriesMap[item.day] = [];
                }
                deliveriesMap[item.day].push({
                    menuItemId: item.id,
                    jumlah: item.quantity,
                });
            });

            const deliveries = Object.keys(deliveriesMap).map((day) => ({
                hari: day,
                items: deliveriesMap[day],
            }));

            // Buat order
            const orderResponse = await api.post(
                "/orders/multi-day",
                {
                    deliveries,
                    lokasiPengiriman: userData.address,
                    metodePengambilan:
                        userData.deliveryMethod || "Kirim ke Lokasi",
                },
                {
                    headers: { "x-auth-token": token },
                }
            );

            const orderId = orderResponse.data.order._id;

            // Get payment token
            const checkoutResponse = await api.post(
                `/orders/${orderId}/checkout`,
                {},
                { headers: { "x-auth-token": token } }
            );

            const snapToken = checkoutResponse.data.token;

            // Tampilkan popup Midtrans
            window.snap.pay(snapToken, {
                onSuccess: function (result) {
                    alert("Pembayaran berhasil!");
                    clearCart();
                    router.push("/profile");
                },
                onPending: function (result) {
                    alert("Menunggu pembayaran...");
                    router.push("/profile");
                },
                onError: function (result) {
                    alert("Pembayaran gagal! Silakan coba lagi.");
                },
                onClose: function () {
                    alert(
                        "Popup ditutup. Anda bisa melanjutkan pembayaran dari My Orders."
                    );
                },
            });
        } catch (err) {
            alert(
                err.response?.data?.message || "Terjadi kesalahan saat checkout"
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="max-w-[1140px] mx-auto px-8 py-12">
                <Link
                    href="/menu"
                    className="inline-flex items-center text-[#E5713A] hover:text-[#D46029] font-semibold transition-colors mb-8">
                    <IoArrowBackOutline size={24} className="mr-2" />
                    Kembali ke Menu
                </Link>

                <div className="bg-[#F7F7F7] rounded-[30px] p-8 shadow-lg border-2 border-[#002683]">
                    <h1 className="text-[40px] font-bold text-[#002683] mb-8">
                        Konfirmasi Pesanan
                    </h1>

                    <div className="flex gap-8">
                        {/* KIRI - Form Data Diri (60%) */}
                        <div className="w-[60%]">
                            <h2 className="text-[30px] font-bold text-[#E5713A] mb-6">
                                Data Pemesan
                            </h2>

                            <UserDetailsForm
                                userData={userData}
                                setUserData={setUserData}
                                editable={true}
                            />

                            {/* Tombol Pesan */}
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || isProcessing}
                                className={`w-full py-4 mt-6 rounded-[20px] font-bold text-lg
                                          transition-all shadow-md
                                          ${
                                              cart.length > 0 && !isProcessing
                                                  ? "bg-[#E5713A] text-white hover:bg-[#D46029] hover:shadow-lg hover:scale-[1.02]"
                                                  : "bg-[#D9D9D9] text-[#9D9D9D] cursor-not-allowed"
                                          }`}>
                                {isProcessing
                                    ? "Memproses..."
                                    : cart.length > 0
                                    ? "Pesan Sekarang"
                                    : "Keranjang Kosong"}
                            </button>
                        </div>

                        {/* KANAN - Ringkasan Pesanan (40%) */}
                        <div className="w-[40%]">
                            <OrderSumBox
                                cart={cart}
                                totalAmount={getTotal()}
                                totalItems={totalItems}
                                showCheckoutButton={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KonfirmasiPesananPage;
