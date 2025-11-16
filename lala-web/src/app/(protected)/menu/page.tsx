"use client";

import Header from "@/components/layout/header";
import Search from "@/components/search";
import DropdownFilter from "@/components/dropdownFilter";
import CardMenu from "@/components/cardMenu";
import axios from "axios";

import React, { useState, useMemo, useEffect } from "react";

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

const Page = () => {
    const [menuList, setMenuList] = useState<MenuItem[]>([]);
    const [selectedHari, setSelectedHari] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // ==========================
    // 🔥 FETCH DATA API
    // ==========================
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/jadwal/mingguan`,
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
        <div className="min-h-screen">
            <Header />

            <div className="max-w-[1140px] mx-auto">
                <div className="sticky top-0 z-10 py-2 -mt-1 mb-5 bg-white ease-in-out w-full">
                    <div className="w-fit flex items-start gap-[10px]">
                        <div className="flex-1">
                            <Search
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari menu hari ini..."
                            />
                        </div>

                        <div className="flex-shrink-0 w-fit">
                            <DropdownFilter
                                name="Pilih Hari"
                                options={hariList.map(
                                    (h) =>
                                        h.charAt(0).toUpperCase() + h.slice(1)
                                )}
                                value={
                                    selectedHari
                                        ? selectedHari.charAt(0).toUpperCase() +
                                        selectedHari.slice(1)
                                        : null
                                }
                                onSelect={(v: string) =>
                                    setSelectedHari(
                                        v ? v.toLowerCase() : null
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-[30px]">
                    {menuByDay.map((group) => (
                        <div key={group.day} className="mb-6">
                            <div className="flex items-center mb-6">
                                <h2 className="text-[40px] font-semibold text-[#002683] flex-shrink-0 w-[150px] capitalize">
                                    {group.day}
                                </h2>
                                <hr className="border-dashed border-t-2 border-[#E5713A] w-full ml-4" />
                            </div>

                            <div className="grid grid-cols-4 gap-[33.3px]">
                                {group.menus.map((menu) => (
                                    <CardMenu
                                        key={menu.id + group.day}
                                        id={menu.id}
                                        imageSrc={menu.imageSrc}
                                        name={menu.name}
                                        description={menu.description}
                                        price={menu.price}
                                        day={group.day}
                                    />
                                ))}
                            </div>

                            {group.menus.length === 0 && (
                                <p className="text-gray-500 italic mt-4">
                                    Tidak ada menu untuk hari {group.day}.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
