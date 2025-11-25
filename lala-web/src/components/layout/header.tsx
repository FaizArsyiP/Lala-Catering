"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HiOutlineUserCircle, HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";


const navItems = [
    { label: "HOME", href: "/" },
    { label: "MENU", href: "/menu" },
];

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const headerRef = useRef<HTMLHeadingElement | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        if (headerRef.current) {
            const height = headerRef.current.offsetHeight;
            document.documentElement.style.setProperty("--header-height", `${height}px`);
        }
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleLogoutClick = () => {
        setMenuOpen(false);
        setMobileMenuOpen(false);
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setShowLogoutModal(false);
        window.dispatchEvent(new Event("authStateChanged"));
        router.push("/");
        router.refresh();
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <>
            <header
                ref={headerRef}
                id="app-header"
                className="
                    w-full
                    min-h-[60px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] xl:min-h-[140px]
                    flex items-center justify-center 
                    px-4 sm:px-8 md:px-12 lg:px-[10vw] xl:px-[15vw]
                    sticky top-0 z-[100]
                "
            >
                {/* CONTENTS CONTAINER */}
                <div className="
                    w-full
                    px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8
                    py-2 sm:py-3 md:py-4
                    min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px]
                    flex items-center justify-between
                    bg-white rounded-full shadow-lg
                ">
                    {/* LEFT SIDE - Logo & Navigation */}
                    <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                        {/* LOGO */}
                        <div
                            className="
                                relative 
                                w-10 h-10
                                sm:w-12 sm:h-12
                                md:w-14 md:h-14
                                lg:w-16 lg:h-16
                                xl:w-[70px] xl:h-[70px]
                                flex-shrink-0
                                cursor-pointer
                            "
                            onClick={() => router.push("/")}
                        >
                            <Image
                                src="/assets/header/logo.svg"
                                alt="Lala Catering Logo"
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* DESKTOP NAVIGATION */}
                        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={item.href === "/" ? handleHomeClick : undefined}
                                    className={`
                                        text-sm md:text-base lg:text-lg xl:text-xl
                                        font-medium hover:text-gray-600 transition-colors whitespace-nowrap
                                        ${pathname === item.href ? "text-[#002683] font-bold" : "text-[#002683]"}
                                    `}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                        {/* CUSTOMER SUPPORT - Hidden on mobile */}
                        <div className="
                            hidden sm:block
                            relative 
                            w-5 h-5
                            sm:w-6 sm:h-6
                            md:w-7 md:h-7
                            lg:w-8 lg:h-8
                            cursor-pointer
                        ">
                            <Image
                                src="/assets/header/customersupport.svg"
                                alt="Customer Support Icon"
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* DESKTOP - SIGN IN/OUT BUTTON */}
                        <div className="hidden md:flex items-center">
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button onClick={() => setMenuOpen(!menuOpen)}>
                                        <HiOutlineUserCircle className="
                                            w-10 h-10 
                                            lg:w-12 lg:h-12 
                                            xl:w-14 xl:h-14 
                                            text-[#002683] cursor-pointer hover:text-[#E5713A] transition-colors
                                        " />
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg border py-2 z-50">
                                            <button
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    router.push("/profile");
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                onClick={handleLogoutClick}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/signin"
                                    className="
                                        px-4 py-2 md:px-5 md:py-2 lg:px-6 lg:py-2.5 xl:px-7 xl:py-3
                                        text-white rounded-full bg-[#E5713A] 
                                        text-sm md:text-base lg:text-lg xl:text-xl
                                        font-bold hover:bg-[#d46332] transition-colors whitespace-nowrap
                                    "
                                >
                                    SIGN IN
                                </Link>
                            )}
                        </div>

                        {/* MOBILE MENU BUTTON */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-[#002683] p-1"
                        >
                            {mobileMenuOpen ? (
                                <HiOutlineXMark className="w-7 h-7 sm:w-8 sm:h-8" />
                            ) : (
                                <HiOutlineBars3 className="w-7 h-7 sm:w-8 sm:h-8" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE MENU OVERLAY */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* MOBILE MENU PANEL */}
            <div className={`
                md:hidden fixed top-[calc(var(--header-height,60px))] right-0 
                w-64 sm:w-72 h-[calc(100vh-var(--header-height,60px))]
                bg-white shadow-2xl z-[95]
                transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="flex flex-col h-full p-6">
                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-4 mb-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => {
                                    if (item.href === "/") handleHomeClick(e);
                                    setMobileMenuOpen(false);
                                }}
                                className={`
                                    text-lg font-medium py-2 px-4 rounded-lg transition-colors
                                    ${pathname === item.href 
                                        ? "bg-[#002683] text-white font-bold" 
                                        : "text-[#002683] hover:bg-gray-100"}
                                `}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t pt-6 mt-auto">
                        {isLoggedIn ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        router.push("/profile");
                                    }}
                                    className="flex items-center gap-3 py-3 px-4 text-[#002683] hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <HiOutlineUserCircle className="w-6 h-6" />
                                    <span className="font-medium">Profile</span>
                                </button>
                                <button
                                    onClick={handleLogoutClick}
                                    className="py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-left"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/signin"
                                onClick={() => setMobileMenuOpen(false)}
                                className="
                                    block w-full text-center
                                    px-6 py-3
                                    text-white rounded-full bg-[#E5713A] 
                                    text-base font-bold hover:bg-[#d46332] transition-colors
                                "
                            >
                                SIGN IN
                            </Link>
                        )}
                    </div>

                    {/* Customer Support Link */}
                    <div className="mt-4 pt-4 border-t">
                        <button className="flex items-center gap-3 py-2 px-4 text-[#002683] hover:bg-gray-100 rounded-lg transition-colors w-full">
                            <div className="relative w-5 h-5">
                                <Image
                                    src="/assets/header/customersupport.svg"
                                    alt="Customer Support"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-sm font-medium">Customer Support</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* LOGOUT CONFIRMATION MODAL */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">
                            Konfirmasi Logout
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Yakin ingin keluar?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelLogout}
                                className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;