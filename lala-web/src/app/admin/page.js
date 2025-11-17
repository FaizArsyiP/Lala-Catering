"use client";

import React, { useState } from "react";
import DataTable from "@/components/admin/dataTable";
import DropdownFilter from "@/components/dropdownFilter";
import StatCard from "@/components/admin/statCard";
import { HiOutlineShoppingCart, HiOutlineBanknotes } from "react-icons/hi2";
import { useOrders } from "@/hooks/useOrders";
import { groupByDayAndMenu, convertGroupedData } from "@/utils/menuUtils";

const DashboardAdmin = () => {
    // KONFIGURASI KOLOM untuk tabel dashboard
    const columns = [
        {
            key: "day",
            label: "Hari",
            type: "text",
            align: "left",
        },
        {
            key: "image",
            label: "Produk",
            type: "image",
            showName: true,
            nameKey: "name",
            align: "left",
        },
        {
            key: "quantity",
            label: "Jumlah",
            type: "quantity",
            align: "center",
        },
        {
            key: "revenue",
            label: "Pendapatan",
            type: "currency",
            align: "right",
        },
    ];

    // DATA untuk tabel
    const { orders, loading } = useOrders("/orders");

    const groupedData = React.useMemo(() => {
        if (!orders || orders.length === 0) return {};
        return groupByDayAndMenu(orders);
    }, [orders]);

    const tableData = React.useMemo(() => {
        return convertGroupedData(groupedData);
    }, [groupedData]);


    const [selectedDay, setSelectedDay] = React.useState(null);
    const filteredData = React.useMemo(() => {
        return selectedDay
            ? tableData.filter((item) => item.day === selectedDay)
            : tableData;
    }, [selectedDay, tableData]);
    const dayOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-lg text-gray-600">Memuat data...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-[36px] font-semibold text-[#E5713A] mb-4">
                Dashboard
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <StatCard
                    title="Jumlah Pesanan"
                    value={tableData.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                    )}
                    
                    icon={HiOutlineShoppingCart}
                />
                <StatCard
                    title="Pendapatan"
                    value={tableData.reduce(
                        (sum, item) => sum + item.revenue,
                        0
                    )}
                    isCurrency={true}
                    icon={HiOutlineBanknotes}
                />
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="text-[#E5713A]">
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

            <DataTable columns={columns} data={filteredData} theme="blue" />
        </div>
    );
};

export default DashboardAdmin;
