import React from "react";
import { IoChevronDown } from "react-icons/io5";

const FormInput = ({ 
    label, 
    value, 
    onChange, 
    editable = true, 
    type = 'text', 
    isSelect = false, 
    options = []     
}) => {

    return (
        <div className="mb-6">
            <label className="block text-[#002683] text-[20px] font-semibold mb-1">
                {label}
            </label>
            
            {editable ? (
                // MODE EDIT
                isSelect ? (
                    // DROPDOWN SELECT
                    <div className="relative w-full">
                        <select
                            value={value}
                            onChange={onChange}
                            className="w-full px-4 py-3 border-2 border-[#9D9D9D] rounded-[20px] 
                                     bg-white text-[#5B5B5B] font-medium
                                     focus:outline-none focus:border-[#E5713A] focus:ring-2 focus:ring-[#E5713A]/20
                                     appearance-none cursor-pointer pr-10"
                        >
                            {options.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        
                        <div className="absolute pr-4 right-4 top-1/2 -translate-y-1/2 text-[#5B5B5B] text-xl pointer-events-none">
                            <IoChevronDown  />
                        </div>
                    </div>
                ) : (
                    // INPUT BIASA
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={`Masukkan ${label.toLowerCase()}`}
                        className="w-full px-4 py-3 border-2 border-[#9D9D9D] rounded-[20px] 
                                 bg-white text-[#5B5B5B]
                                 focus:outline-none focus:border-[#E5713A] focus:ring-2 focus:ring-[#E5713A]/20
                                 placeholder:text-[#9D9D9D]"
                    />
                )
            ) : (
                // MODE READ-ONLY
                <div className="w-full px-4 py-3 bg-[#F7F7F7] border-2 border-[#9D9D9D] 
                              rounded-[20px] text-[#5B5B5B] font-medium">
                    {value || '- Tidak Ada Data -'}
                </div>
            )}
        </div>
    );
};

export default FormInput;