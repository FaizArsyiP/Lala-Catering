"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const CardMenu = ({
    id,
    imageSrc,
    name,
    description,
    price,
    initialQuantity = 0
}) => {

    const [quantity, setQuantity] = useState(initialQuantity);

    const handleQuantityChange = (action) => {
        switch (action) {
            case 'increment':
                setQuantity(prevQuantity => prevQuantity + 1);
                break;
            case 'decrement':
                setQuantity(prevQuantity => prevQuantity -1);
                break;
            case 'add':
                setQuantity(1);
                break;
        }
    };

    const formatPrice = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

  return (
    <div className='h-[400px] w-[300px] border-2 border-[#E5713A] rounded-[20px] overflow-hidden'>
        <div className='w-full h-[250px] relative border-b-2 border-b-[#E5713A] overflow-hidden mb-2'> 
            <Image
                src={imageSrc}
                alt={name}
                layout='fill'
                objectFit='cover'
            />
        </div>

        <div className='flex flex-col gap-0.5 mx-4 mb-4'> 
            <h3 className='text-[20px] font-semibold text-[#002683]'>{name} </h3>
            <p className='text-[12px] text-[#5B5B5B] leading-tight'>{description} </p>
        </div>

        <div className='flex justify-between items-center mx-4'>
            <span className='text-[18px] font-semibold text-[#E5713A]'>{formatPrice(price)}</span>

            {quantity === 0 ? (
                <button onClick={() => handleQuantityChange('add')}
                        className='h-10 w-30 bg-white rounded-[10px]  border-2 border-[#E5713A] text-[#E5713A] text-[18px] font-semibold transition-colors duration-200 hover:bg-[#FFE8D6]'>
                    Add
                </button>
            ) : (
                <div className='flex h-10 w-30 items-center border-2 border-[#E5713A] rounded-[10px] overflow-hidden'> 
                    <button onClick={() => handleQuantityChange('decrement')}
                            className='w-10 h-full flex items-center justify-center bg-white text-[#E5713A] text-[20px] font-bold border-r-2 border-[#E5713A] transition-colors duration-200 hover:bg-[#FFE8D6]'>
                        -
                    </button>

                    <span className="w-10 h-full flex items-center justify-center bg-white text-[#E5713A] text-[20px] font-semibold">
                        {quantity}
                    </span>

                    <button onClick={() => handleQuantityChange('increment')}
                            className='w-10 h-full flex items-center justify-center bg-white text-[#E5713A] text-[20px] font-bold border-l-2 border-[#E5713A] transition-colors duration-200 hover:bg-[#FFE8D6]'>
                        +
                    </button>
                </div>
            )}
        </div>
    </div>
  )
}

export default CardMenu;