"use client";

import React, { useState } from "react";
import { IoCart, IoClose } from "react-icons/io5";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const formatPrice = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

const groupItemsByDay = (items) => {
    return items.reduce((acc, item) => {
        const day = item.day || "Lainnya";
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(item);
        return acc;
    }, {});
};

const CartDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { cart, getTotal, totalItems, updateQuantity } = useCart();

    const totalAmount = getTotal();
    const groupedCart = groupItemsByDay(cart);
    const daysInCart = Object.keys(groupedCart);

    const handleIncrement = (e, id, day) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("INCREMENT clicked for:", id, day);
        updateQuantity(id, day, 1);
    };

    const handleDecrement = (e, id, day) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("DECREMENT clicked for:", id, day);
        updateQuantity(id, day, -1);
    };

    return (
        <>
            {/* TOMBOL dengan Icon Cart */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    right: isOpen ? "400px" : "0px",
                    top: "150px",
                    zIndex: 1000000,
                    backgroundColor: "#F7F7F7",
                    color: "#E5713A",
                    padding: "14px 40px",
                    borderRadius: "20px 0 0 20px",
                    border: "none",
                    boxShadow: "-4px 4px 10px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                }}>
                <IoCart size={35} />
                {totalItems > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-10px",
                            left: "0px",
                            backgroundColor: "#E5713A",
                            color: "white",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                        }}>
                        {totalItems}
                    </span>
                )}
            </button>

            {/* OVERLAY */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999998,
                    }}
                />
            )}

            {/* SIDEBAR PANEL */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: isOpen ? "0" : "-450px",
                    width: "400px",
                    height: "100vh",
                    borderRadius: "20px 0 0 20px",
                    backgroundColor: "#F7F7F7",
                    boxShadow: "-4px 4px 10px rgba(0,0,0,0.3)",
                    zIndex: 999999,
                    transition: "right 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                }}>
                {/* HEADER */}
                <div
                    style={{
                        paddingTop: "24px",
                        paddingBottom: "24px",
                        marginLeft: "24px",
                        marginRight: "24px",
                        borderBottom: "2px dashed #E5713A",
                    }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                        <h1
                            style={{
                                fontSize: "30px",
                                fontWeight: "bold",
                                color: "#002683",
                            }}>
                            Ringkasan Pesanan
                        </h1>
                    </div>
                    <p
                        style={{
                            fontSize: "16px",
                            fontWeight: "medium",
                            color: "#002683",
                        }}>
                        {totalItems} Item
                    </p>
                </div>

                {/* CONTENT - Daftar Item Cart */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                    {cart.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                color: "#5B5B5B",
                                paddingTop: "40px",
                            }}>
                            Keranjang masih kosong.
                        </div>
                    ) : (
                        daysInCart.map((day) => (
                            <div key={day} style={{ marginBottom: "24px" }}>
                                <h2
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        marginBottom: "6px",
                                        color: "#002683",
                                    }}>
                                    {day}
                                </h2>

                                {groupedCart[day].map((item) => (
                                    <div
                                        key={item.id + item.day}
                                        style={{
                                            paddingBottom: "6px",
                                            marginBottom: "6px",
                                            borderBottom: "1px dashed #9D9D9D",
                                        }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    paddingRight: "16px",
                                                }}>
                                                <p
                                                    style={{
                                                        margin: "0 0 4px 0",
                                                        fontSize: "16px",
                                                        fontWeight: "500",
                                                        color: "#002683",
                                                    }}>
                                                    {item.name}
                                                </p>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "14px",
                                                        color: "#5B5B5B",
                                                    }}>
                                                    {formatPrice(
                                                        item.price *
                                                            item.quantity
                                                    )}
                                                </p>
                                            </div>

                                            {/* Kontrol Kuantitas */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    border: "1px solid #002683",
                                                    borderRadius: "6px",
                                                    overflow: "hidden",
                                                }}>
                                                <button
                                                    onClick={(e) =>
                                                        handleDecrement(
                                                            e,
                                                            item.id,
                                                            item.day
                                                        )
                                                    }
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        border: "none",
                                                        backgroundColor:
                                                            "7F7F7F",
                                                        color: "#002683",
                                                        fontSize: "18px",
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                    }}>
                                                    −
                                                </button>
                                                <span
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        borderLeft:
                                                            "1px solid #002683",
                                                        borderRight:
                                                            "1px solid #002683",
                                                        fontSize: "14px",
                                                        backgroundColor:
                                                            "7F7F7F",
                                                        color: "#002683",
                                                    }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={(e) =>
                                                        handleIncrement(
                                                            e,
                                                            item.id,
                                                            item.day
                                                        )
                                                    }
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        border: "none",
                                                        backgroundColor:
                                                            "7F7F7F",
                                                        color: "#002683",
                                                        fontSize: "18px",
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                    }}>
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* FOOTER */}
                <div
                    style={{
                        paddingTop: "24px",
                        paddingBottom: "24px",
                        marginLeft: "24px",
                        marginRight: "24px",
                        borderTop: "2px dashed #E5713A",
                    }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "16px",
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#002683",
                        }}>
                        <span>Total</span>
                        <span>{formatPrice(totalAmount)}</span>
                    </div>
                    <Link href="/konfirmasi-pesanan">
                        <button
                            onClick={() => setIsOpen(false)}
                            disabled={cart.length === 0}
                            style={{
                                width: "100%",
                                padding: "14px",
                                backgroundColor:
                                    cart.length > 0 ? "#E5713A" : "#9D9D9D",
                                color: "white",
                                borderRadius: "20px",
                                fontSize: "20px",
                                fontWeight: "medium",
                                cursor:
                                    cart.length > 0 ? "pointer" : "not-allowed",
                                transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (cart.length > 0) {
                                    e.currentTarget.style.backgroundColor =
                                        "#D46029";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (cart.length > 0) {
                                    e.currentTarget.style.backgroundColor =
                                        "#E5713A";
                                }
                            }}>
                            Konfirmasi Pesanan
                        </button>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;