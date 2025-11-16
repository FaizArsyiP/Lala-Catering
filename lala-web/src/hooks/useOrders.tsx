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
    hari: string;
    tanggalPengiriman: string;
    items: DeliveryItem[];
    subtotal: number;
    statusDelivery: string;
    _id: string;
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
    const [order, setOrder] = useState<Order | null>(null);
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
                setOrder(res.data); // BUKAN array
                setLoading(false);
            })
            .catch((err) => {
                console.error("Gagal mengambil data pesanan:", err);
                setOrder(null);
                setLoading(false);
            });
    }, [endpoint]);

    return { order, loading };
}

