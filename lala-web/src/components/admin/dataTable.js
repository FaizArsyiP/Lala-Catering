import React from 'react';
import Image from 'next/image';

/**
 * Komponen Tabel Universal yang bisa digunakan untuk berbagai keperluan
 * 
 * @param {Array} columns - Konfigurasi kolom yang akan ditampilkan
 * @param {Array} data - Data yang akan ditampilkan di tabel
 * @param {String} theme - Tema warna: "blue" atau "dark"
 */
const DataTable = ({ 
    columns = [], 
    data = [], 
    theme = "blue" 
}) => {
    
    // Tentukan warna berdasarkan theme
    const themeColors = {
        blue: {
            header: "bg-[#002683]",
            headerText: "text-white",
            rowHover: "hover:bg-[#F0F5FF]"
        },
        dark: {
            header: "bg-[#1E293B]",
            headerText: "text-white",
            rowHover: "hover:bg-[#F7F7F7]"
        }
    };
    
    const colors = themeColors[theme] || themeColors.blue;

    // Format harga ke Rupiah
    const formatPrice = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Render cell berdasarkan tipe kolom
    const renderCell = (column, rowData) => {
        const value = rowData[column.key];

        // Custom render jika ada
        if (column.render) {
            return column.render(value, rowData);
        }

        // Render default berdasarkan tipe
        switch (column.type) {
            case 'image':
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F7F7F7] rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                                src={value || '/placeholder-food.jpg'}
                                alt={rowData.name || 'Product'}
                                width={40}
                                height={40}
                                className="object-cover"
                                onError={(e) => {
                                    e.target.src = '/placeholder-food.jpg';
                                }}
                            />
                        </div>
                        {column.showName && (
                            <span className="text-[#002683] font-medium">
                                {rowData[column.nameKey || 'name']}
                            </span>
                        )}
                    </div>
                );

            case 'currency':
                return (
                    <span className="text-[#E5713A] font-bold">
                        {formatPrice(value)}
                    </span>
                );

            case 'quantity':
                return (
                    <span className="inline-block px-3 py-1 bg-[#E5713A] text-white font-bold rounded-full text-sm">
                        x{value}
                    </span>
                );

            case 'badge':
                return (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                        ${value === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                        {value}
                    </span>
                );

            case 'text':
            default:
                return (
                    <span className="text-[#002683] font-medium">
                        {value}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white rounded-[20px] shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    
                    {/* HEADER */}
                    <thead className={colors.header}>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 font-semibold ${colors.headerText}
                                        ${column.align === 'center' ? 'text-center' : ''}
                                        ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {data.length === 0 ? (
                            // Empty State
                            <tr>
                                <td 
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-[#9D9D9D]"
                                >
                                    <p className="text-lg">Tidak ada data</p>
                                </td>
                            </tr>
                        ) : (
                            // Data Rows
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`border-b border-[#E5E5E5] transition-colors ${colors.rowHover}`}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4
                                                ${column.align === 'center' ? 'text-center' : ''}
                                                ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                                        >
                                            {renderCell(column, row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;