"use client";

import React, { useState } from 'react';
import { IoArrowBackOutline } from 'react-icons/io5';
import Link from 'next/link';
import Header from '@/components/layout/header';
import OrderSumBox from '@/components/orderSumBox'; 
import UserDetailsForm from '@/components/userDetailsForm'; 
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation'; 

const KonfirmasiPesananPage = () => {
    const router = useRouter(); 
    const { cart, getTotal, totalItems } = useCart();

    const [userData, setUserData] = useState({
        name: 'Maritza Vania', 
        phone: '081234567890',
        email: 'maritza@example.com',
        deliveryMethod: 'Reguler (3 Hari)', 
        address: 'Jl. Contoh Perumahan No. 123',
        paymentMethod: 'QRIS',
    });

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Keranjang Anda kosong!');
            return;
        }
        if (!userData.name || !userData.phone || !userData.email || !userData.address) {
            alert('Mohon lengkapi semua data!');
            return;
        }

        console.log('Data Pesanan:', { items: cart, user: userData });

        router.push('/payment'); 
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />
            
            <div className="max-w-[1140px] mx-auto px-8 py-12">
                <Link href="/menu" className="inline-flex items-center text-[#E5713A] hover:text-[#D46029] font-semibold transition-colors mb-8">
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
                                disabled={cart.length === 0}
                                className={`w-full py-4 mt-6 rounded-[20px] font-bold text-lg 
                                          transition-all shadow-md
                                          ${cart.length > 0 
                                              ? 'bg-[#E5713A] text-white hover:bg-[#D46029] hover:shadow-lg hover:scale-[1.02]' 
                                              : 'bg-[#D9D9D9] text-[#9D9D9D] cursor-not-allowed'
                                          }`}
                            >
                                {cart.length > 0 ? 'Pesan Sekarang' : 'Keranjang Kosong'}
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