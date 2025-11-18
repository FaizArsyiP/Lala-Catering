"use client";

import React, { useState, useMemo, useEffect } from 'react';
import DataTable from '@/components/admin/dataTable';
import Search from '@/components/search';
import DropdownFilter from '@/components/dropdownFilter';
import MenuActionButtons from '@/components/admin/menuActionButtons';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

const ITEM_PER_PAGE_OPTIONS = [10, 20, 50];
const DAY_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const STATUS_OPTIONS = ['Aktif', 'Tidak Aktif'];

// Helper function: capitalize first letter
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper function: Transform backend data to frontend format
const transformMenuData = (menuItems) => {
    return menuItems
        .filter(item => item.jadwal && Array.isArray(item.jadwal) && item.jadwal.length > 0) // ← FILTER: Skip menu tanpa jadwal
        .map(item => ({
            id: item._id,
            name: item.nama,
            description: item.deskripsi,
            price: item.harga,
            stock: item.stok,
            image: item.imageUrl || '/assets/dummy/pic1.jpg', // fallback image
            days: item.jadwal.map(capitalize), // ['senin'] → ['Senin']
            day: item.jadwal.map(capitalize).join(', '), // For display: 'Senin, Selasa'
            // Handle menu lama tanpa field isActive → default true (Aktif)
            status: (item.isActive === false) ? 'Tidak Aktif' : 'Aktif',
            isActive: item.isActive !== undefined ? item.isActive : true // Default true untuk menu lama
        }));
};

// --- KOMPONEN KELOLA TOKO ---
const KelolaTokoPage = () => {
    const [menuData, setMenuData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // --- HANDLER AKSI TABEL ---
    const router = useRouter();

    // --- FETCH MENU DATA ---
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get('/menu');

                // Check for menu without jadwal
                const menuWithoutJadwal = response.data.filter(
                    item => !item.jadwal || !Array.isArray(item.jadwal) || item.jadwal.length === 0
                );

                if (menuWithoutJadwal.length > 0) {
                    console.warn(`⚠️ ${menuWithoutJadwal.length} menu tanpa jadwal (tidak ditampilkan):`,
                        menuWithoutJadwal.map(m => m.nama));
                }

                const transformedData = transformMenuData(response.data);
                setMenuData(transformedData);
            } catch (err) {
                console.error('Error fetching menu data:', err);
                setError(err.response?.data?.message || 'Gagal memuat data menu');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMenuData();
    }, []);

    const handleDetailClick = (id) => {
        router.push(`/admin/kelola-toko/detail/${id}`);
    };

    const handleStatusChangeClick = (id) => {
        router.push(`/admin/kelola-toko/edit/${id}`);
    };

    const handleTambahMenu = () => {
        router.push('/admin/kelola-toko/new');
    };

    // --- FILTER & SEARCH LOGIC ---
    const filteredData = useMemo(() => {
        let data = menuData;

        // Filter by day - check if selectedDay is in the days array
        if (selectedDay) {
            data = data.filter(item => item.days.includes(selectedDay));
        }

        // Filter by search term
        if (searchTerm) {
            data = data.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (selectedStatus) {
            data = data.filter(item => item.status === selectedStatus);
        }

        return data;
    }, [menuData, searchTerm, selectedDay, selectedStatus]);

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


    // --- LOADING & ERROR STATE ---
    if (isLoading) {
        return (
            <div className='w-full mx-auto max-w-[1140px]'>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#E5713A] mx-auto mb-4"></div>
                        <p className="text-xl text-[#5B5B5B] font-medium">Memuat data menu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='w-full mx-auto max-w-[1140px]'>
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <p className="text-xl text-red-600 font-medium mb-2">Error memuat data</p>
                        <p className="text-[#5B5B5B]">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-[#E5713A] text-white rounded-lg hover:bg-[#d65535]"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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