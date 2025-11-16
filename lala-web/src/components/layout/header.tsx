"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HiOutlineUserCircle } from "react-icons/hi2";

const navItems = [
    { label: "HOME", href: "/"},
    { label: "MENU", href: "/menu"},
]

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);


    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);
    
    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname === "/") {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/");
        router.refresh();
    }

    return (
        <header className="w-full
                        xs:min-h-[80px] tablet:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] xl:min-h-[160px] desk:min-h-[180px]
                        flex items-center justify-center">
            
            {/* CONTENTS CONTAINER */}
            <div className="w-full
                            xs:px-[15px] tablet:px-[20px] md:px-[25px] lg:px-[28px] xl:px-[29px] desk:px-[30px]
                            xs:py-[5px] tablet:py-[7px] md:py-[8px] lg:py-[9px] xl:py-[9px] desk:py-[10px]
                            xs:min-h-[50px] tablet:min-h-[60px] md:min-h-[70px] lg:min-h-[80px] xl:min-h-[90px] desk:min-h-[100px]
                            flex items-center justify-between
                            bg-white rounded-full">

                {/* LEFT SIDE */}
                <div className="xs:w-[180px] tablet:w-[200px] md:w-[220px] lg:w-[250px] xl:w-[280px] desk:w-[300px]
                               h-full flex items-center xs:gap-4 tablet:gap-5 md:gap-6 lg:gap-7 xl:gap-8 desk:gap-9">
                    {/* LOGO */}
                    <div className="relative 
                                   xs:w-[40px] xs:h-[40px]
                                   tablet:w-[50px] tablet:h-[50px]
                                   md:w-[55px] md:h-[55px]
                                   lg:w-[60px] lg:h-[60px]
                                   xl:w-[65px] xl:h-[65px]
                                   desk:w-[70px] desk:h-[70px]
                                   flex-shrink-0">
                        <Image
                            src="/assets/header/logo.svg"
                            alt="Lala Catering Logo"
                            fill
                            className="object-contain cursor-pointer"
                            onClick={() => router.push("/")}
                        />
                    </div>
                    
                    {/* NAVIGATION */}
                    <nav className="flex items-center xs:gap-2 tablet:gap-3 md:gap-4 lg:gap-5 xl:gap-6 desk:gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={item.href === "/" ? handleHomeClick : undefined}
                                className={`xs:text-xs tablet:text-base md:text-md lg:text-lg xl:text-xl desk:text-base
                                           font-medium font-century-gothic-regular hover:text-gray-600 transition-colors whitespace-nowrap ${
                                    pathname === item.href ? "text-[#002683] font-bold" : "text-[#002683]"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* RIGHT SIDE */}
                <div className="xs:w-[140px] tablet:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[230px] desk:w-[250px]
                               h-full flex items-center justify-end xs:gap-2 tablet:gap-3 md:gap-3 lg:gap-4 xl:gap-4 desk:gap-4">
                    {/* CUSTOMER SUPPORT */}
                    <Link 
                        href="/support" 
                        className="xs:text-[10px] tablet:text-[11px] md:text-xs lg:text-sm xl:text-sm desk:text-base
                                  font-medium text-gray-500 hover:text-gray-600 transition-colors whitespace-nowrap
                                  xs:hidden md:block"
                    >
                        Support
                    </Link>
                    
                    {/* SIGN IN/OUT BUTTON */}
                    {isLoggedIn ? (
                        <div className="relative">
                            {/* User Icon */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className=""
                            >
                                <HiOutlineUserCircle className="w-14 h-14 text-[#002683] cursor-pointer hover:text-[#E5713A] transition-colors" />
                            </button>
                            {/* Dropdown Menu */}
                            {menuOpen && (
                                <div className="absolute right-0  w-44 bg-white text-black rounded-lg shadow-lg border py-2 z-50 flex flex-col ">
                                    <button 
                                        onClick={() => router.push("/profile")}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        Profile
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/signin"
                            className="xs:px-3 xs:py-1.5 tablet:px-4 tablet:py-1.5 md:px-5 md:py-2 lg:px-5 lg:py-2 xl:px-6 xl:py-2 desk:px-6 desk:py-2
                                      bg-[#E5713A] text-white rounded-full 
                                      xs:text-xs tablet:text-base md:text-md lg:text-lg xl:text-xl
                                      font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

            </div>

        </header>
    )
}

export default Header;