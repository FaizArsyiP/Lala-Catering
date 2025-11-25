"use client";

import Header from "@/components/layout/header";
import Search from "@/components/search";
import DropdownFilter from "@/components/dropdownFilter";
import CardMenu from "@/components/cardMenu";
import React, { useState, useMemo, useEffect } from "react";
import api from "@/utils/axiosInstance";

interface ApiMenuItem {
    menuId: string;
    nama: string;
    deskripsi: string;
    harga: number;
    imageUrl?: string | null;
    available: number;
}

interface ApiScheduleItem {
    hari: string;
    menuTersedia: ApiMenuItem[];
}

interface MenuItem {
    id: string;
    imageSrc: string;
    name: string;
    description: string;
    price: number;
    available: number;
    day: string;
}

/**
 * Helper: Check if a day has passed (simple check)
 * Returns true if day is today or later in the week
 */
const isDayAvailable = (dayName: string): boolean => {
    const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const targetDayIndex = daysOfWeek.indexOf(dayName);

    if (targetDayIndex === -1) {
        return false;
    }

    // Available if target day >= current day (same week)
    // Senin=1, Selasa=2, ..., Sabtu=6
    return targetDayIndex >= currentDayIndex;
};

const Page = () => {
    const [menuList, setMenuList] = useState<MenuItem[]>([]);
    const [selectedHari, setSelectedHari] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isStoreOpen, setIsStoreOpen] = useState(true);
    const [storeClosedReason, setStoreClosedReason] = useState("");

    const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // ==========================
    // 🔥 FETCH DATA API
    // ==========================
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await api.get(
                    `/jadwal/mingguan`,
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                ); // ganti URL
                const data = await res.data;

                // Transform JSON API → format menuList
                const converted: MenuItem[] = data.schedule.flatMap(
                    (dayItem: ApiScheduleItem) => {
                        return dayItem.menuTersedia.map((menu) => ({
                            id: menu.menuId,
                            name: menu.nama,
                            description: menu.deskripsi,
                            price: menu.harga,
                            available: menu.available,
                            day: dayItem.hari.toLowerCase(),
                            imageSrc: menu.imageUrl ?? "/assets/dummy/pic1.jpg", // fallback kalau null
                        }));
                    }
                );

                setMenuList(converted);
            } catch (error) {
                console.error("Gagal fetch API:", error);
            }
        };

        fetchMenu();
    }, []);

    // ==========================
    // 🔥 FETCH STORE STATUS
    // ==========================
    useEffect(() => {
        const fetchStoreStatus = async () => {
            try {
                const res = await api.get(`/store/status`);
                setIsStoreOpen(res.data.isOpen);
                setStoreClosedReason(res.data.closedReason || "Toko sedang tutup sementara");
            } catch (error) {
                console.error("Gagal fetch store status:", error);
            }
        };

        fetchStoreStatus();
    }, []);

    // ==========================
    // FILTER SEARCH + FILTER HARI
    // ==========================
    const filteredMenu = useMemo(() => {
        return menuList.filter((menu) => {
            const matchesSearch =
                menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesHari =
                !selectedHari ||
                menu.day.toLowerCase() === selectedHari.toLowerCase();

            return matchesSearch && matchesHari;
        });
    }, [searchTerm, selectedHari, menuList]);

    // Group menu by day
    const menuByDay = useMemo(() => {
        const grouped = hariList.map((day) => ({
            day,
            menus: filteredMenu.filter(
                (menu) => menu.day.toLowerCase() === day.toLowerCase()
            ),
        }));

        if (selectedHari) {
            return grouped.filter(
                (group) =>
                    group.day.toLowerCase() === selectedHari.toLowerCase()
            );
        }

        return grouped;
    }, [filteredMenu, selectedHari]);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Store Closed Banner */}
            {!isStoreOpen && (
                <div className="bg-red-500 text-white py-4 px-6 text-center">
                    <p className="text-[20px] font-bold">🔴 Toko Sedang Tutup</p>
                    <p className="text-[16px] mt-1">{storeClosedReason}</p>
                    <p className="text-[14px] mt-2 opacity-90">Pesanan tidak dapat dilakukan saat ini. Silakan kembali lagi nanti.</p>
                </div>
            )}

            <div className="max-w-[1140px] mx-auto px-4 tablet:px-6">
                <div className="top-10 z-10 py-2 mb-5 ease-in-out w-full bg-transparent">
                    <div className="w-full flex flex-col tablet:flex-row items-stretch tablet:items-start gap-3 tablet:gap-[10px]">
                        <div className="flex-1 w-full tablet:w-auto">
                            <Search
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari menu hari ini..."
                            />
                        </div>

                        <div className="flex-shrink-0 w-full tablet:w-fit">
                            <DropdownFilter
                                name="Pilih Hari"
                                options={hariList.map((h) => {
                                    const isAvailable = isDayAvailable(h);
                                    const displayName = h.charAt(0).toUpperCase() + h.slice(1);
                                    // Add indicator for unavailable days in dropdown
                                    return isAvailable
                                        ? displayName
                                        : `${displayName} 🔒`;
                                })}
                                value={
                                    selectedHari
                                        ? selectedHari.charAt(0).toUpperCase() +
                                        selectedHari.slice(1)
                                        : null
                                }
                                onSelect={(v: string) => {
                                    // Remove lock emoji if present
                                    const cleanValue = v ? v.replace(' 🔒', '') : null;
                                    const isAvailable = isDayAvailable(cleanValue || '');

                                    // Only allow selection of available days
                                    if (isAvailable) {
                                        setSelectedHari(cleanValue ? cleanValue.toLowerCase() : null);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-[30px]">
                    {menuByDay.map((group) => {
                        // Check if this day is available for ordering (simple check)
                        const isAvailable = isDayAvailable(group.day.charAt(0).toUpperCase() + group.day.slice(1));

                        return (
                            <div key={group.day} className="mb-6">
                                <div className="flex items-center mb-6">
                                    <h2 className={`text-2xl tablet:text-3xl md:text-[40px] font-semibold flex-shrink-0 w-[100px] tablet:w-[150px] capitalize ${
                                        isAvailable ? "text-[#002683]" : "text-gray-400"
                                    }`}>
                                        {group.day}
                                    </h2>
                                    <hr className={`border-dashed border-t-2 w-full ml-4 ${
                                        isAvailable ? "border-[#E5713A]" : "border-gray-300"
                                    }`} />

                                    {/* Badge for unavailable days only */}
                                    {!isAvailable && (
                                        <span className="ml-4 px-4 py-2 bg-gray-200 text-gray-600 text-sm font-semibold rounded-full whitespace-nowrap">
                                            🔒 Tidak Tersedia
                                        </span>
                                    )}
                                </div>

                                <div className={`grid grid-cols-1 tablet:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 tablet:gap-6 md:gap-[33.3px] ${
                                    !isAvailable ? "opacity-50 pointer-events-none" : ""
                                }`}>
                                    {group.menus.map((menu) => (
                                        <CardMenu
                                            key={menu.id + group.day}
                                            id={menu.id}
                                            imageSrc={menu.imageSrc}
                                            name={menu.name}
                                            description={menu.description}
                                            price={menu.price}
                                            day={group.day}
                                            isStoreOpen={isStoreOpen && isAvailable}
                                        />
                                    ))}
                                </div>

                                {group.menus.length === 0 && (
                                    <p className="text-gray-500 italic mt-4">
                                        Tidak ada menu untuk hari {group.day}.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Page;
