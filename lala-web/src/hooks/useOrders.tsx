"use client";

import api from "@/utils/axiosInstance";
import { useEffect, useState } from "react";

export type OrderItem = {
    menuItemId: {
        _id: string;
        nama: string;
        harga: number;
    };
    namaItem: string;
    harga: number;
    jumlah: number;
    _id: string;
};

export type Delivery = {
    _id: string;
    hari: string;
    tanggalPengiriman: string;
    items: OrderItem[];
    subtotal: number;
    statusDelivery: string;
};

export type Order = {
    _id: string;
    status: string;
    metodePengambilan: string;
    userInfo: {
        nama: string;
        nomorTelepon: string;
    };
    totalHarga: number;
    items: OrderItem[];        // Untuk single-day orders
    deliveries?: Delivery[];   // Untuk multi-day orders
    isMultiDay?: boolean;
};

export function useOrders(endpoint: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!endpoint) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setLoadingOrders(false);
            return;
        }

        api.get(endpoint, {
            headers: {
                "x-auth-token": token,
            },
        })
            .then((res) => {
                setOrders(res.data);
                setLoadingOrders(false);
            })
            .catch((err) => {
                console.error("Gagal mengambil data pesanan:", err);
                setOrders([]);
                setLoadingOrders(false);
            });
    }, [endpoint]);

    return { orders, loadingOrders };
}
