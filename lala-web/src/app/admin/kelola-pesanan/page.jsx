"use client";
import { useOrders } from "@/hooks/useOrders";
import PesananList from "@/components/orderList";

export default function kelolaPesanan() {
    const { orders, loading } = useOrders("/orders");
    return (
        <>
            <h1 className="text-2xl font-bold text-[#EF6C6C] mb-3">
                Kelola Pesanan
            </h1>
            <PesananList orders={orders} loading={loading} isAdmin={true} />
        </>
    );
}
