import React from 'react';

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
    return "text-gray-500";
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
    <div className='p-[16px] bg-[#F7F7F7] rounded-[20px] border-2 border-[#002683] w-full'>
  
        {/* ROW 1: Title + Icon */}
        <div className='flex justify-between items-start'>
            <h3 className='text-[24px] font-semibold text-[#002683]'>{title}</h3>
            {IconComponent && <IconComponent className='text-[#E5713A] w-[26px] h-[26px]' />}
        </div>

        <p className='text-[18px] font-medium text-[#E5713A] mb-4'> Minggu Ini</p>

        {/* ROW 2: Value + Change Percentage */}
        <div className='flex justify-between items-center'>
            {/* Value */}
            <p className='text-[34px] font-bold text-[#002683]'>
            {formatValue(value)}
            </p>

            {/* Change Percentage */}
            <span className={`text-[16px] font-semibold ${getChangeColor()}`}>
            {isPositive && "+"}{isNegative && "-"}{absChange}%
            </span>
        </div>

    </div>
  );
};

export default StatCard;