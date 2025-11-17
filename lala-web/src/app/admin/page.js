"use client";

import React, { useState } from 'react';
import DataTable from '@/components/admin/dataTable';
import DropdownFilter from '@/components/dropdownFilter';
import StatCard from '@/components/admin/statCard';
import { HiOutlineShoppingCart, HiOutlineBanknotes } from "react-icons/hi2";

const DashboardAdmin = () => {
    
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
            showName: true,  
            nameKey: 'name', 
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

    // DATA DUMMY untuk tabel
    const data = [
        {
            day: 'Senin',
            image: '/assets/dummy/pic1.jpg',
            name: 'Senin - Nasi Goreng Seafood',
            quantity: 20,
            revenue: 400000
        },
        {
            day: 'Rabu',
            image: '/assets/dummy/pic2.jpg',
            name: 'Rabu - Soto Ayam',
            quantity: 100,
            revenue: 1000000
        }
    ];

    const [selectedDay, setSelectedDay] = React.useState(null);
    const filteredData = selectedDay ? data.filter(item => item.day === selectedDay) : data;
    const dayOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <div>
            <h2 className="text-[40px] font-semibold text-[#E5713A] mb-4">
                Dashboard
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <StatCard
                    title="Jumlah Pesanan"
                    value={data.reduce((sum, item) => sum + item.quantity, 0)}
                    changePercentage={12.5}
                    icon={HiOutlineShoppingCart}
                />
                <StatCard
                    title="Pendapatan"
                    value={data.reduce((sum, item) => sum + item.revenue, 0)}
                    changePercentage={-8.3}
                    isCurrency={true}
                    icon={HiOutlineBanknotes}
                />
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className='text-[#E5713A]'>
                    <h2 className="text-[36px] font-semibold">
                        Ringkasan Pesanan
                    </h2>
                    <p className="text-[24px]">Minggu Ini</p>
                </div>

                <div>
                    <DropdownFilter
                        name="Pilih Hari"
                        options={dayOptions}
                        value={selectedDay}
                        onSelect={setSelectedDay}
                    />
                </div>
            </div>

            <DataTable 
                columns={columns}
                data={filteredData}
                theme="blue"
            />
        </div>
    );
};

export default DashboardAdmin;