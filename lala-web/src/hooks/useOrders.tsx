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

export type Order = {
    _id: string;
    status: string;
    metodePengambilan: string;
    userInfo: {
        nama: string;
        nomorTelepon: string;
    };
    items: OrderItem[];
};

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoadingOrders(false);
            return;
        }

        api.get(`/orders/myorders`, {
            headers: {
                "x-auth-token": token,
            },
        })
            .then((res) => {
                setOrders(res.data); // ← data sesuai Postman
                setLoadingOrders(false);
            })
            .catch((err) => {
                console.error("Gagal mengambil data pesanan:", err);
                setOrders([]);
                setLoadingOrders(false);
            });
    }, []);

    return { orders, loadingOrders };
}
