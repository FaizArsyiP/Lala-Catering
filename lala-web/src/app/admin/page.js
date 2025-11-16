"use client";

import React from 'react';
import DataTable from '@/components/admin/dataTable';

const DashboardRingkasanPesanan = () => {
    
    // KONFIGURASI KOLOM untuk tabel dashboard
    const columns = [
        {
            key: 'day',
            label: 'Hari',
            type: 'text',
            align: 'left'
        },
        {
            key: 'image',
            label: 'Produk',
            type: 'image',
            showName: true,  // Tampilkan nama produk di samping gambar
            nameKey: 'name', // Key untuk nama produk
            align: 'left'
        },
        {
            key: 'quantity',
            label: 'Jumlah',
            type: 'quantity',
            align: 'center'
        },
        {
            key: 'revenue',
            label: 'Pendapatan',
            type: 'currency',
            align: 'right'
        }
    ];

    // DATA untuk tabel
    const data = [
        {
            day: 'Senin',
            image: '/images/nasi-goreng.jpg',
            name: 'Senin - Nasi Goreng Seafood',
            quantity: 20,
            revenue: 400000
        },
        {
            day: 'Rabu',
            image: '/images/soto-ayam.jpg',
            name: 'Rabu - Soto Ayam',
            quantity: 100,
            revenue: 1000000
        }
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#002683] mb-2">
                    Ringkasan Pesanan
                </h2>
                <p className="text-[#5B5B5B]">
                    Minggu Ini
                </p>
            </div>

            <DataTable 
                columns={columns}
                data={data}
                theme="blue"
            />
        </div>
    );
};

export default DashboardRingkasanPesanan;