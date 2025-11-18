"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IoArrowBackOutline } from "react-icons/io5";
import MenuForm from '@/components/admin/menuForm';
import Image from 'next/image';
import api from '@/utils/axiosInstance';

// Helper function: capitalize first letter
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Fetch menu data from API
const fetchMenuData = async (id) => {
    try {
        const response = await api.get(`/menu/${id}`);
        const item = response.data;

        // Transform backend data to frontend format
        return {
            id: item._id,
            name: item.nama,
            price: item.harga,
            stock: item.stok,
            days: item.jadwal ? item.jadwal.map(capitalize) : [],
            // Handle menu lama tanpa field isActive → default 'Aktif'
            status: (item.isActive === false) ? 'Tidak Aktif' : 'Aktif',
            description: item.deskripsi,
            imageName: item.imageUrl ? item.imageUrl.split('/').pop() : ''
        };
    } catch (error) {
        console.error('Error fetching menu:', error);
        throw error;
    }
};

// --- KOMPONEN PAGE UTAMA ---
const MenuActionPage = () => {
    const router = useRouter();
    const params = useParams();
    const action = params.action;

    // Tentukan mode berdasarkan action
    const isCreateMode = action === 'new';
    const isDetailMode = action === 'detail';
    const isEditMode = action === 'edit';

    // menuId diambil dari params.id (optional catch-all route)
    // params.id adalah array, ambil element pertama
    const menuId = params.id ? params.id[0] : null;

    // State untuk mode saat ini (bisa berubah dari detail ke edit)
    const [currentMode, setCurrentMode] = useState(
        isCreateMode ? 'create' : isDetailMode ? 'detail' : 'edit'
    );

    const isReadOnly = currentMode === 'detail';

    // Initial form data
    const initialFormData = {
        name: '',
        price: '',
        stock: '',
        status: 'Aktif',
        description: '',
        days: [],
        image: null,
        imageName: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [originalFormData, setOriginalFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(!isCreateMode);

    // --- Data Fetching (untuk Edit/Detail Mode) ---
    useEffect(() => {
        if (!isCreateMode && menuId) {
            const loadData = async () => {
                setIsLoading(true);
                const data = await fetchMenuData(menuId);
                if (data) {
                    const loadedData = {
                        ...data,
                        image: null,
                        imageName: data.imageName || '',
                    };
                    setFormData(loadedData);
                    setOriginalFormData(loadedData);
                } else {
                    alert('Menu tidak ditemukan!');
                    router.push('/admin/kelola-toko');
                }
                setIsLoading(false);
            };
            loadData();
        }
    }, [isCreateMode, menuId, router]);

    // --- Form Handlers ---
    const handleChange = (e) => {
        if (isReadOnly) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDaysChange = (day) => {
        if (isReadOnly) return;
        setFormData(prev => {
            const currentDays = prev.days;
            if (currentDays.includes(day)) {
                return { ...prev, days: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, days: [...currentDays, day] };
            }
        });
    };

    const handleImageChange = (e) => {
        if (isReadOnly) return;
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            image: file,
            imageName: file ? file.name : prev.imageName
        }));
    };

    // --- Action Handlers ---
    const handleSubmit = async () => {
        // Validasi
        if (!formData.name || !formData.price || !formData.stock || !formData.description) {
            alert('Mohon lengkapi semua field yang wajib!');
            return;
        }
        if (formData.days.length === 0) {
            alert('Pilih minimal 1 hari tersedia!');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                return;
            }

            // Prepare FormData for upload (supports image)
            const submitData = new FormData();
            submitData.append('nama', formData.name);
            submitData.append('deskripsi', formData.description);
            submitData.append('harga', formData.price);
            submitData.append('stok', formData.stock);

            // Convert days to lowercase for backend
            const jadwalLowercase = formData.days.map(day => day.toLowerCase());
            submitData.append('jadwal', JSON.stringify(jadwalLowercase));

            // Convert status 'Aktif'/'Tidak Aktif' to boolean isActive
            const isActive = formData.status === 'Aktif';
            submitData.append('isActive', isActive.toString());

            // Add image if exists
            if (formData.image) {
                submitData.append('gambar', formData.image);
            }

            let response;
            if (isCreateMode) {
                // Create new menu
                response = await api.post('/menu', submitData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('Menu berhasil ditambahkan!');
            } else {
                // Update existing menu
                response = await api.put(`/menu/${menuId}`, submitData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('Menu berhasil diupdate!');
            }

            router.push('/admin/kelola-toko');
        } catch (err) {
            console.error('Error saving menu:', err);
            alert(err.response?.data?.message || 'Gagal menyimpan menu');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Yakin ingin menghapus menu ini?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                return;
            }

            await api.delete(`/menu/${menuId}`, {
                headers: { 'x-auth-token': token }
            });

            alert('Menu berhasil dihapus!');
            router.push('/admin/kelola-toko');
        } catch (err) {
            console.error('Error deleting menu:', err);
            alert(err.response?.data?.message || 'Gagal menghapus menu');
        }
    };

    const handleEdit = () => {
        setCurrentMode('edit');
    };

    const handleCancel = () => {
        if (currentMode === 'edit' && !isCreateMode) {
            // Kembali ke detail mode dan restore data original
            setFormData(originalFormData);
            setCurrentMode('detail');
        } else {
            // Kembali ke list
            router.push('/admin/kelola-toko');
        }
    };

    const handleBack = () => {
        router.push('/admin/kelola-toko');
    };

    // --- Page Metadata ---
    const getPageTitle = () => {
        if (currentMode === 'create') return 'Tambah Menu Baru';
        if (currentMode === 'edit') return 'Edit Menu';
        if (currentMode === 'detail') return 'Detail Menu';
        return 'Form Menu';
    };

    const getSubmitButtonText = () => {
        if (currentMode === 'create') return 'Tambahkan Menu';
        if (currentMode === 'edit') return 'Simpan Perubahan';
        return 'Simpan';
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="w-full max-w-[1140px] mx-auto px-4">
                <div className="text-center py-20 text-xl font-medium text-[#E5713A]">
                    Memuat data menu...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1140px] mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col mb-8">
                {/* Row 1 */}
                <div className="flex items-center gap-4 cursor-pointer border-b-2 border-transparent hover:border-[#E5713A] transition-all"
                    onClick={handleBack}>
                    <Image src="/assets/icons/arrow-back.svg" alt="Kembali" width={40} height={40} />
                    <h2 className="text-[#E5713A] text-[40px] font-semibold">Kelola Toko</h2>
                </div>

                {/* Row 2 */}
                <div className="flex flex-row items-center gap-2 text-[20px] text-[#5B5B5B]">
                    <p className="font-medium cursor-pointer hover:underline" onClick={handleBack}>
                    Kelola Toko
                    </p>
                    <span>&gt;</span>
                    <p className="font-medium">{getPageTitle()}</p>
                </div>

                {/* Action Buttons untuk Detail Mode */}
                {currentMode === 'detail' && (
                <div className="flex gap-3">
                    <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-[#E5713A] text-white font-semibold rounded-xl hover:bg-[#d65535] transition-all flex items-center gap-2"
                    >
                    <Image src="/assets/icons/edit-button.svg" alt="Edit" width={20} height={20} />
                    Edit Menu
                    </button>

                    <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                    <Image src="/assets/icons/delete-button.svg" alt="Hapus" width={20} height={20} />
                    Hapus Menu
                    </button>
                </div>
                )}
            </div>

            {/* Form Component */}
            <MenuForm
                formData={formData}
                handleChange={handleChange}
                handleDaysChange={handleDaysChange}
                handleImageChange={handleImageChange}
                isReadOnly={isReadOnly}
            />

            {/* Action Buttons untuk Create/Edit Mode */}
            {!isReadOnly && (
                <div className="mt-6 flex justify-end gap-4">
                    <button
                    onClick={handleCancel}
                    className="px-6 py-3 border-2 border-[#002683] text-[rgb(0,38,131)] font-bold rounded-xl hover:bg-[#F7F7F7] transition-all flex items-center gap-2">
                    <Image src="/assets/icons/cancel-button.svg" alt="Batal" width={20} height={20} />
                    Batal
                    </button>

                    <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-[#E5713A] text-white font-semibold rounded-xl hover:bg-[#d65535] transition-all flex items-center gap-2">
                    <Image src="/assets/icons/save-button.svg" alt="Simpan" width={20} height={20} />
                    {getSubmitButtonText()}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuActionPage;
