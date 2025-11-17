"use client";

import Header from "@/components/layout/header";
import Search from "@/components/search";
import DropdownFilter from "@/components/dropdownFilter";
import CardMenu from "@/components/cardMenu";
import DummyMenu from "@/data/dummyMenu";
import React, { useState, useMemo } from "react";

interface MenuItem {
    _id: string;
    imageSrc: string;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
    day: string;
}

const menuList: MenuItem[] = DummyMenu as MenuItem[];

const Page = () => {
    const [selectedHari, setSelectedHari] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const filteredMenu = useMemo(() => {
        return menuList.filter((menu) => {
            const matchesSearch =
                menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesHari = !selectedHari || menu.day === selectedHari;

            return matchesSearch && matchesHari;
        });
    }, [searchTerm, selectedHari]);

    const menuByDay = useMemo(() => {
        const grouped = hariList.map((day) => ({
            day,
            menus: filteredMenu.filter((menu) => menu.day === day),
        }));

        if (selectedHari) {
            return grouped.filter((group) => group.day === selectedHari);
        }

        return grouped;
    }, [filteredMenu, selectedHari]);

    return (
        <div className="min-h-screen">
            <Header />

            <div className="sticky top-0 z-10 px-20 py-5 my-5 bg-white ease-in-out w-full">
                <div className="w-fit flex items-start gap-[10px]">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <Search
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari menu hari ini..."
                        />
                    </div>

                    {/* Filter Dropdown Hari */}
                    <div className="flex-shrink-0 w-fit">
                        <DropdownFilter
                            name="Pilih Hari"
                            options={hariList}
                            value={selectedHari}
                            onSelect={setSelectedHari}
                        />
                    </div>
                </div>
            </div>

            <div className="px-20 flex flex-col gap-10">
                {menuByDay.map((group) => (
                    <div key={group.day} className="mb-6">
                        <div className="flex items-center mb-6">
                            <h2 className="text-[40px] font-semibold text-[#002683] flex-shrink-0 w-[150px]">
                                {group.day}
                            </h2>
                            <hr className="border-dashed border-t-2 border-[#E5713A] w-full ml-4" />
                        </div>

                        {/* Grid Card Menu */}
                        <div className="grid grid-cols-4 gap-[30px]">
                            {group.menus.map((menu: MenuItem) => (
                                <CardMenu
                                    key={menu._id + group}
                                    id={menu._id}
                                    imageSrc={menu.imageSrc}
                                    name={menu.name}
                                    description={menu.description}
                                    price={menu.price}
                                />
                            ))}
                        </div>

                        {group.menus.length === 0 && (
                            <p className="text-gray-500 italic mt-4">
                                Tidak ada menu yang ditemukan untuk hari{" "}
                                {group.day}.
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
