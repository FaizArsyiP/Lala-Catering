import React from "react";
import Image from "next/image";

const DataTable = ({ columns = [], data = [] }) => {
    const formatPrice = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const renderCell = (column, rowData) => {
        const value = rowData[column.key];

        if (column.render) {
            return column.render(value, rowData);
        }

        switch (column.type) {
            case "image":
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-[35px] h-[35px] bg-[#F7F7F7] rounded-md overflow-hidden flex-shrink-0">
                            <Image
                                src={value || "/assets/dummy/pic1.jpg"}
                                alt={rowData.name || "Product"}
                                width={35}
                                height={35}
                                className="object-cover"
                                onError={(e) => {
                                    e.target.src = "/assets/dummy/pic1.jpg";
                                }}
                            />
                        </div>
                        {column.showName && (
                            <span className="text-[#002683] text-[16px]">
                                {rowData[column.nameKey || "name"]}
                            </span>
                        )}
                    </div>
                );

            case "currency":
                return (
                    <span className="text-[#002683] text-[16px]">
                        {formatPrice(value)}
                    </span>
                );

            case "quantity":
                return (
                    <span className="text-[#002683] text-[16px]">x{value}</span>
                );

            case "badge":
                return (
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                            ${
                                value === "Aktif"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}>
                        {value}
                    </span>
                );

            case "text":
            default:
                return (
                    <span className="text-[#002683] text-[14px]">{value}</span>
                );
        }
    };

    return (
        <div className="bg-white rounded-[20px] shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* HEADER */}
                    <thead className="bg-[#002683]">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 font-semibold text-white
                                            ${
                                                column.align === "center"
                                                    ? "text-center"
                                                    : ""
                                            }
                                            ${
                                                column.align === "right"
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}>
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
                                    className="px-6 py-5 text-center text-[#5B5B5B]">
                                    <p className="text-lg">Tidak ada data</p>
                                </td>
                            </tr>
                        ) : (
                            // Data Rows
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`border-b border-[#D9D9D9] hover:bg-[#F7F7F7] transition-colors`}>
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4
                                                ${
                                                    column.align === "center"
                                                        ? "text-center"
                                                        : ""
                                                }
                                                ${
                                                    column.align === "right"
                                                        ? "text-right"
                                                        : "text-left"
                                                }`}>
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
