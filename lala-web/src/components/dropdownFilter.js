"use client"

import React, { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

const DropdownFilter = ({ name, options, value, onSelect, allowReset = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  const displayValue = value ? String(value) : null;
  
  const formattedDisplay = displayValue 
    ? displayValue.charAt(0).toUpperCase() + displayValue.slice(1) 
    : name;

    const optionsWithClear = allowReset ? [null, ...options] : options;

  return (
    <div className="relative w-fit">
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full h-[60px] px-5 bg-white border-2 border-[#E5713A] rounded-[20px] gap-5 flex justify-between items-center"
      >
        <span className="text-[20px] text-[#E5713A] font-semibold">
          {formattedDisplay}
        </span>

        <IoChevronDown
          size={24}
          color="#E5713A"
          className={`${isOpen ? "rotate-180" : ""} transition-transform duration-200`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute left-0 right-0 z-10 bg-[#F7F7F7] max-h-48 overflow-auto shadow-md"
        >
          {optionsWithClear.map((option, index) => (
            <li
              key={index}
              className={`px-5 py-3 text-[#5B5B5B] cursor-pointer text-[14px] transition-colors
                ${option === null ? 'text-[#5B5B5B] border-b border-slate-100' : 'hover:bg-[#F8F4F2]'}
                ${value === option ? 'bg-[#F8F4F2]' : ''}
              `}
              onClick={() => handleSelect(option)}
            >
              {option ?? `Reset ${name}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownFilter;
