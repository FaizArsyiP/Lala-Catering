"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

const CardMenu = ({
    id,
    imageSrc,
    name,
    description,
    price,
    initialQuantity = 0,
    day 
}) => {

    const { addToCart, updateQuantity, cart } = useCart();

    const cartItem = cart.find(item => item.id === id && item.day === day);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('ADD clicked for:', id, day);
        addToCart({ id, name, price, day, imageSrc, description });
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('INCREMENT clicked for:', id, day);
        updateQuantity(id, day, 1);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('DECREMENT clicked for:', id, day);
        updateQuantity(id, day, -1);
    };

    const formatPrice = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

  return (
    <div className='h-[370px] w-[260px] border-2 border-[#E5713A] rounded-[20px] overflow-hidden flex flex-col bg-white '>
        <div className='w-full h-[200px] relative border-b-2 border-b-[#E5713A] overflow-hidden mb-2'> 
            <Image
                src={imageSrc}
                alt={name}
                layout='fill'
                objectFit='cover'
            />
        </div>

        <div className='flex flex-col gap-0.5 mx-4 mb-4 flex-grow '> 
            <h3 className='text-2xl font-semibold text-[#002683]'>{name} </h3>
            <p className='text-lg text-[#5B5B5B] leading-tight overflow-hidden'>{description} </p>
        </div>

        <div className='flex justify-between items-center mx-4 mb-4 mt-auto'>
            <span className='text-[16px] font-semibold text-[#E5713A]'>{formatPrice(price)}</span>

            {quantity === 0 ? (
                <button onClick={handleAdd}
                        className='h-10 w-30 bg-white rounded-[10px]  border-2 border-[#E5713A] text-[#E5713A] text-[16px] font-semibold transition-colors duration-200 hover:bg-[#FFE8D6]'>
                    Add
                </button>
            ) : (
                <div className='flex h-10 w-30 items-center border-2 border-[#E5713A] rounded-[10px] overflow-hidden'> 
                    <button onClick={handleDecrement}
                            className='w-10 h-full flex items-center justify-center bg-white text-[#E5713A] text-[18px] font-bold border-r-2 border-[#E5713A] transition-colors duration-200 hover:bg-[#FFE8D6]'>
                        -
                    </button>

                    <span className="w-10 h-full flex items-center justify-center bg-white text-[#E5713A] text-[16px] font-semibold">
                        {quantity}
                    </span>

                    <button onClick={handleIncrement}
                            className='w-10 h-full flex items-center justify-center bg-white text-[#E5713A] text-[18px] font-bold border-l-2 border-[#E5713A] transition-colors duration-200 hover:bg-[#FFE8D6]'>
                        +
                    </button>
                </div>
            )}
        </div>
    </div>
  )
}

export default CardMenu;