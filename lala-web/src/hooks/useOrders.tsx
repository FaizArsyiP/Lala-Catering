"use client";

import api from "@/utils/axiosInstance";
import { useEffect, useState } from "react";

export type DeliveryItem = {
    menuItemId: string;
    namaItem: string;
    harga: number;
    jumlah: number;
    _id: string;
    id: string;
};

export type Delivery = {
    _id: string;
    hari: string;
    tanggalPengiriman: string;
    items: DeliveryItem[];
    subtotal: number;
    statusDelivery: string;
};

export type Order = {
    _id: string;
    userInfo: {
        nama: string;
        nomorTelepon: string;
        email: string;
    };
    userId: string;
    deliveries: Delivery[];
    items: DeliveryItem[];
    totalHarga: number;
    alamatPengirimanText: string;
    metodePengambilan: string;
    status: string;
    tanggalPesanan: string;
    createdAt: string;
    updatedAt: string;
    midtransTransactionId: string;
    isMultiDay: boolean;
    deliveryProgress: string;
    id: string;
};

export function useOrders(endpoint: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!endpoint) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        api.get(endpoint, {
            headers: {
                "x-auth-token": token,
            },
        })
            .then((res) => {
                console.log("Data pesanan berhasil diambil:", res.data);
                // Handle both single order and array of orders
                const data = Array.isArray(res.data) ? res.data : [res.data];
                setOrders(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Gagal mengambil data pesanan:", err);
                setOrders([]);
                setLoading(false);
            });
    }, [endpoint]);

    return { orders, loading };
}

