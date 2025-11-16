import React from 'react';

const formatPrice = (value) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(value);
};

const groupItemsByDay = (items) => {
    return items.reduce((acc, item) => {
      const day = item.day || 'Lainnya'; 
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      return acc;
    }, {});
};

const OrderSumBox = ({ 
    cart, 
    totalAmount, 
    totalItems, 
    showCheckoutButton = false, 
    checkoutAction 
}) => {
    
    const groupedCart = groupItemsByDay(cart);
    const daysInCart = Object.keys(groupedCart);

    return (
        <div className="w-full overflow-hidden flex flex-col">
            
            {/* HEADER */}
            <div className='mx-6 pb-6 border-b-2 border-dashed border-[#E5713A]'>
                <h1 className="text-[30px] font-bold text-[#E5713A] mb-1">
                     Ringkasan Pesanan
                </h1>
                <p className="text-[16px] font-medium text-[#5B5B5B]">
                    {totalItems} Item
                </p>
            </div>

            {/* CONTENT - Daftar Item */}
            <div className="flex-1 px-6 py-6 max-h-[60vh] overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="text-center text-[#5B5B5B] py-10">
                        Keranjang masih kosong
                    </div>
                ) : (
                    daysInCart.map(day => {
                        const dayItems = groupedCart[day];
                        
                        return (
                            <div key={day} className="mb-6 last:mb-0">
                                {/* Nama Hari */}
                                <h3 className="text-[20px] font-bold text-[#002683] mb-2">
                                    {day}
                                </h3>
                                
                                {/* List Item per Hari */}
                                <div>
                                    {dayItems.map((item) => (
                                        <div 
                                            key={item.id + item.day}
                                            className="pb-2.5 mb-2.5 border-b border-dashed border-[#9D9D9D]" 
                                        >
                                        {/* ROW 1 — Nama & Harga, kiri-kanan seperti footer */}
                                        <div className="flex justify-between items-start">
                                            
                                            {/* Nama Menu */}
                                            <p className="text-base font-medium text-[#002683]">
                                                {item.name}
                                            </p>
                                
                                            {/* Harga Total */}
                                            <p className="text-base font-medium text-[#002683] whitespace-nowrap">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                
                                        {/* ROW 2 — Quantity */}
                                        <p className="text-sm text-[#5B5B5B] mt-0.5">
                                            x {item.quantity}
                                        </p>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* FOOTER - Total & Button */}
            <div className="pt-6 pb-6 mx-6 border-t-2 border-dashed border-[#E5713A]">
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-[#002683]">
                        Total
                    </span>
                    <span className="text-xl font-bold text-[#E5713A]">
                        {formatPrice(totalAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderSumBox;