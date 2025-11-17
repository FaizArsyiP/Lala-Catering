"use client";

import React from 'react';
import FormInput from '@/components/formInput';

const DAY_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const STATUS_OPTIONS = ['Aktif', 'Tidak Aktif'];

const MenuForm = ({ 
    formData, 
    handleChange, 
    handleDaysChange, 
    handleImageChange, 
    isReadOnly = false
}) => {
    
    return (
        <div className="bg-[#F7F7F7] p-8 rounded-[20px] shadow-lg border-2 border-[#002683]">
                
                {/* Kolom Kiri */}
                <div className="space-y-6">
                    <FormInput
                        label="Nama Menu"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        editable={!isReadOnly}
                        type="text"
                    />

                    <div>
                        <label className="block text-[#002683] text-lg font-semibold mb-2">
                            Deskripsi
                        </label>
                        {isReadOnly ? (
                            <div className="w-full px-4 py-3 bg-[#F7F7F7] border-2 border-[#D9D9D9] 
                                          rounded-[20px] text-[#5B5B5B] min-h-[100px]">
                                {formData.description || '- Tidak ada deskripsi -'}
                            </div>
                        ) : (
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Jelaskan detail menu..."
                                className="w-full px-4 py-3 border-2 border-[#D9D9D9] rounded-[20px] 
                                         bg-white text-[#002683]
                                         focus:outline-none focus:border-[#E5713A] focus:ring-2 focus:ring-[#E5713A]/20
                                         placeholder:text-[#9D9D9D] resize-y"
                            />
                        )}
                    </div>

                    <div className='grid grid-cols-2 gap-8 mt-6'>
                        <div className='space-y-6'>
                            <FormInput
                                label="Harga per Unit (Rp)"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                editable={!isReadOnly}
                                type="number"
                            />

                            <FormInput
                                label="Jumlah Stok"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                editable={!isReadOnly}
                                type="number"
                            />
                            <div>
                                <label className="block text-[#002683] text-lg font-semibold mb-2">
                                    Foto Menu
                                </label>
                                {isReadOnly ? (
                                    <div className="w-full px-4 py-3 bg-[#F7F7F7] border-2 border-[#D9D9D9] 
                                                rounded-[20px] text-[#5B5B5B]">
                                        {formData.imageName || '- Tidak ada foto -'}
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full file:mr-4 file:py-2 file:px-4 
                                                    file:rounded-xl file:border-2 file:border-[#D9D9D9]
                                                    file:text-sm file:font-semibold
                                                    file:bg-white file:text-[#002683]
                                                    hover:file:bg-[#F7F7F7] hover:file:cursor-pointer
                                                    text-[#5B5B5B]"
                                        />
                                        {formData.imageName && (
                                            <p className="mt-2 text-sm text-[#5B5B5B]">
                                                File: <strong>{formData.imageName}</strong>
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className='space-y-6'>
                            <FormInput
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            editable={!isReadOnly}
                            isSelect={true}
                            options={STATUS_OPTIONS}
                                />

                            <div>
                                <label className="block text-[#002683] text-lg font-semibold mb-3">
                                    Hari Tersedia
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {DAY_OPTIONS.map((day) => (
                                        <div key={day} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`day-${day}`}
                                                value={day}
                                                checked={formData.days.includes(day)}
                                                onChange={() => handleDaysChange(day)}
                                                disabled={isReadOnly}
                                                className="h-5 w-5 text-[#E5713A] border-[#D9D9D9] rounded 
                                                        focus:ring-[#E5713A] cursor-pointer
                                                        disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            <label 
                                                htmlFor={`day-${day}`} 
                                                className={`ml-2 text-base font-medium text-[#5B5B5B]
                                                        ${!isReadOnly ? 'cursor-pointer' : 'cursor-default'}`}
                                            >
                                                {day}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
        </div>
    );
};

export default MenuForm;