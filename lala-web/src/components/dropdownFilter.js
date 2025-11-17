"use client"

import React, { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

const DropdownFilter = ({ name, options, value, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  const optionsWithClear = [null, ...options];

  return (
    <div className="relative w-fit">
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full h-[60px] px-5 bg-white border-2 border-[#E5713A] rounded-[20px] gap-5 flex justify-between items-center"
      >
        <span className="text-[20px] text-[#E5713A] font-semibold">
          {value ?? name}
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
              className="px-4 py-2 text-[#5B5B5B] cursor-pointer hover:bg-[#D9D9D9]"
              onClick={() => handleSelect(option)}
            >
              {option ?? "Reset Filter"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownFilter;
