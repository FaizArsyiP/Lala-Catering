import React from 'react'
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { HiOutlineBanknotes } from "react-icons/hi2";

const StatCard = ({
    title,
    value,
    changePercentage = 0,
    isCurrency = false,
    icon: IconComponent
}) => {

    const absChange = Math.abs(changePercentage);
    const isPositive = changePercentage > 0;
    const isNegative = changePercentage < 0;

    const getChangeColor = () => {
        if (isPositive) return "text-green-600";
        if (isNegative) return "text-red-600";
        return "text-[#5B5B5B]";
    };

    const formatValue = (val) => {
        if (isCurrency) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }).format(val);
        }
        return val.toLocaleString("id-ID");
    };

    
  return (
    <div className='p-6 bg-[#D7D7D7] rounded-[20px] border-2 border-[#002683]'>
        <div className='flex justify-between items-start mb-3'>
            <h3 className='text-[24px] font-semibold text-[#002683]'>
                {title}
            </h3>

            <div className='text-[#E5713A] p-2 text-[24px]'>
                {icon}
            </div>
        </div>

        <p className='text-[32px] font-semibold text-[#002683]'>
            {formatValue(value)}
        </p>

        <div className='flex items-center text-[18px] mt-1'>
            <span>
                {changePercentage > 0 && "+"}
                {changePercentage}%
            </span>
        </div>
    </div>
  )
}

export default StatCard;