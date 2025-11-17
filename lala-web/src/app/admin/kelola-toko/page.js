"use client";

import React, { useState, useMemo } from 'react';
import DataTable from '@/components/admin/dataTable';
import Search from '@/components/search';
import DropdownFilter from '@/components/dropdownFilter';
import MenuActionButtons from '@/components/admin/menuActionButtons';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

// --- MOCK DATA ---
const generateMockData = () => {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const menuNames = [
        'Nasi Goreng Seafood', 'Es Teh Manis', 'Soto Ayam', 'Nasi Kebuli',
        'Ayam Bakar', 'Sate Kambing', 'Bakso', 'Mie Ayam', 'Gado-Gado',
        'Pecel Lele', 'Rendang', 'Nasi Uduk', 'Bubur Ayam', 'Nasi Kuning'
    ];
    
    const data = [];
    for (let i = 1; i <= 65; i++) {
        data.push({
            id: `M${String(i).padStart(3, '0')}`,
            day: days[i % days.length],
            name: menuNames[i % menuNames.length] + ` ${Math.floor(i/14) + 1}`,
            image: `/assets/dummy/pic${(i % 4) + 1}.jpg`,
            stock: Math.floor(Math.random() * 50) + 5,
            price: Math.floor(Math.random() * 30000) + 10000,
            status: i % 3 === 0 ? 'Tidak Aktif' : 'Aktif'
        });
    }
    return data;
};

const MOCK_MENU_DATA = generateMockData();

const ITEM_PER_PAGE_OPTIONS = [10, 20, 50];
const DAY_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const STATUS_OPTIONS = ['Aktif', 'Tidak Aktif'];

// --- KOMPONEN KELOLA TOKO ---
const KelolaTokoPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    // --- HANDLER AKSI TABEL ---
    const handleDetailClick = (id) => {
        alert(`Lihat Detail Menu ID: ${id}`);
        // Logika navigasi ke halaman detail menu
    };

    const handleStatusChangeClick = (id) => {
        alert(`Ubah Status Menu ID: ${id}`);
        // Logika untuk menampilkan modal atau navigasi ubah status
    };

    const handleTambahMenu = () => {
        alert("Navigasi ke halaman tambah menu baru.");
        // Logika navigasi untuk tambah menu
    };

    // --- FILTER & SEARCH LOGIC ---
    const filteredData = useMemo(() => {
        let data = MOCK_MENU_DATA;

        if (selectedDay) {
            data = data.filter(item => item.day === selectedDay);
        }

        if (searchTerm) {
            data = data.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStatus) {
            data = data.filter(item => item.status === selectedStatus);
        }

        return data;
    }, [searchTerm, selectedDay, selectedStatus]);

    // --- PAGINATION LOGIC ---
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // --- DEFINISI KOLOM DATATABLE ---
    const columns = [
        { key: 'day', label: 'Hari', type: 'text', align: 'left', width: '10%' },
        { 
            key: 'image', 
            label: 'Produk', 
            type: 'image', 
            showName: true, 
            nameKey: 'name', 
            align: 'left', 
            width: '20%' 
        },
        { key: 'stock', label: 'Stok', type: 'quantity', align: 'center', width: '10%' },
        { key: 'price', label: 'Harga', type: 'currency', align: 'right', width: '15%' },
        { key: 'status', label: 'Status', type: 'badge', align: 'center', width: '10%' },
        { 
            key: 'actions', 
            label: 'Aksi', 
            type: 'actions', 
            align: 'right', 
            width: '25%',
            render: (value, row) => (
                <MenuActionButtons 
                    menuId={row.id}
                    onDetailClick={handleDetailClick}
                    onStatusChangeClick={handleStatusChangeClick}
                />
            )
        },
    ];

    // --- RENDER PAGINATION UI ---
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const maxPagesToShow = 5;
        const pages = [];
        
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Tombol Previous
        const isFirstPage = currentPage === 1;
        
        // Tombol Next
        const isLastPage = currentPage === totalPages;

        return (
            <div className="flex justify-center items-center gap-2 mt-8">
                {/* Button Previous */}
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={isFirstPage}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg font-semibold transition-all
                        ${isFirstPage 
                            ? 'bg-[#E5E5E5] text-[#9D9D9D] cursor-not-allowed' 
                            : 'bg-[#F8F4F2] text-[#002683] hover:bg-[#E5713A] hover:text-white'
                        }`}
                >
                    <IoChevronBack size={20} />
                </button>

                {/* First Page */}
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentPage(1)}
                            className="h-10 w-10 text-[14px] rounded-lg font-semibold bg-[#F8F4F2] text-[#002683] hover:bg-[#E5713A] hover:text-white transition-all"
                        >
                            1
                        </button>
                        {startPage > 2 && (
                            <span className="text-[#9D9D9D] font-bold">...</span>
                        )}
                    </>
                )}

                {/* Page Numbers */}
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-10 w-10 text-[14px] rounded-lg font-semibold transition-all
                            ${pageNum === currentPage 
                                ? 'bg-[#E5713A] text-white shadow-md scale-110' 
                                : 'bg-[#F8F4F2] text-[#002683] hover:bg-[#E5713A] hover:text-white'
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Last Page */}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span className="text-[#9D9D9D] font-bold">...</span>
                        )}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="h-10 w-10 text-[14px] rounded-lg font-semibold bg-[#F8F4F2] text-[#002683] hover:bg-[#E5713A] hover:text-white transition-all"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Button Next */}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={isLastPage}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg font-semibold transition-all
                        ${isLastPage 
                            ? 'bg-[#E5E5E5] text-[#9D9D9D] cursor-not-allowed' 
                            : 'bg-[#F8F4F2] text-[#002683] hover:bg-[#E5713A] hover:text-white'
                        }`}
                >
                    <IoChevronForward size={20} />
                </button>
            </div>
        );
    };


    return (
        <div className='w-full mx-auto max-w-[1140px]'>
            {/* Header dan Tombol Aksi */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-[40px] font-semibold text-[#E5713A]">Kelola Toko</h1>
                <div className="flex">
                    <button
                        className="flex items-center justify-center w-[120px] h-[45px] text-[18px] font-semibold text-white bg-[#E5713A] rounded-tl-[10px] rounded-bl-[10px] hover:bg-[#d65535] transition duration-150"
                    >
                        Buka Toko
                    </button>
                    <button
                        className="flex items-center justify-center w-[120px] h-[45px] text-[18px] font-semibold text-[#E5713A] border-2 border-[#E5713A] bg-white rounded-tr-[10px] rounded-br-[10px] hover:bg-[#F8F4F2] transition duration-150"
                    >
                        Tutup Toko
                    </button>
                </div>
            </div>

            {/* Search, Filter, dan Tambah Menu */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex">
                    <Search
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Cari menu, hari, atau status..."
                    />
                </div>

                <button
                    onClick={handleTambahMenu}
                    className="flex items-center justify-center w-[160px] h-[60px] text-[20px] font-semibold text-white bg-[#E5713A] rounded-[20px] hover:bg-[#d65535] shadow-md"
                >
                    Tambah Menu
                </button>
            </div>

            <div className="flex justify-between items-center mb-2">
                <div className="flex gap-4">
                <DropdownFilter
                        name="Hari"
                        options={DAY_OPTIONS}
                        value={selectedDay}
                        onSelect={(value) => {
                            setSelectedDay(value);
                            setCurrentPage(1);
                        }}
                        allowReset={true}
                    />
                    <DropdownFilter
                        name="Status"
                        options={STATUS_OPTIONS}
                        value={selectedStatus}
                        onSelect={(value) => {
                            setSelectedStatus(value);
                            setCurrentPage(1);
                        }}
                        allowReset={true}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-[16px] text-[#5B5B5B] font-medium">Item per halaman</p>
                    <DropdownFilter
                        name=" " 
                        options={ITEM_PER_PAGE_OPTIONS}
                        value={itemsPerPage}
                        onSelect={(value) => {
                            if (typeof value === 'number' && value > 0) {
                                setItemsPerPage(value);
                                setCurrentPage(1); 
                            }
                        }}
                        allowReset={false} 
                    />
                        
                </div>
            </div>

            {/* Info Jumlah Item */}
            <p className="text-[16px] text-[#5B5B5B] mb-6 font-medium">
                Menampilkan {startIndex + 1} - {endIndex} dari {totalItems} item
            </p>

            {/* DataTable Menu */}
            <DataTable 
                columns={columns}
                data={paginatedData}
            />

            {/* Pagination */}
            {renderPagination()}
        </div>
    );
};

export default KelolaTokoPage;