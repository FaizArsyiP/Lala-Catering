import React from 'react';

const MenuActionButtons = ({ menuId, onDetailClick, onStatusChangeClick }) => {
    return (
        <div className="flex flex-col gap-2 items-end">
            {/* Tombol Lihat Detail (Biru) */}
            <button
                onClick={() => onDetailClick(menuId)}
                className="flex items-center justify-center w-[120px] h-[35px] text-[14px] font-semibold text-white bg-[#002683] rounded-md hover:bg-opacity-90 transition duration-150 shadow-md"
            >
                Lihat detail
            </button>

            {/* Tombol Ubah Status/Menu (Oranye) */}
            <button
                onClick={() => onStatusChangeClick(menuId)}
                className="flex items-center justify-center w-[120px] h-[35px] text-[14px] font-semibold text-white bg-[#E5713A] rounded-md hover:bg-[#d65535] transition duration-150 shadow-md"
            >
                Ubah Status
            </button>
        </div>
    );
};

export default MenuActionButtons;