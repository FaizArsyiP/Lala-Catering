"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { HiMenu, HiX } from "react-icons/hi";

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

    // FIX 1 — Use ref instead of document.getElementById
    const headerRef = useRef<HTMLHeadingElement | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    // FIX 2 — Measure header height safely
    useEffect(() => {
        if (headerRef.current) {
            const height = headerRef.current.offsetHeight;
            document.documentElement.style.setProperty("--header-height", `${height}px`);
        }
    }, []);

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.refresh();
    };

    return (
        <header
            ref={headerRef}
            id="app-header"
            className="
                w-full
                min-h-[70px] tablet:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] xl:min-h-[160px] desk:min-h-[180px]
                flex items-center justify-center
                px-4 tablet:px-[15vw]
                sticky top-0 z-[100]
            "
        >
            {/* CONTENTS CONTAINER */}
            <div className="
                w-full
                px-4 tablet:px-[20px] md:px-[25px] lg:px-[28px] xl:px-[29px] desk:px-[30px]
                py-2 tablet:py-[7px] md:py-[8px] lg:py-[9px] xl:py-[9px] desk:py-[10px]
                min-h-[50px] tablet:min-h-[40px] md:min-h-[50px] lg:min-h-[60px] xl:min-h-[70px] desk:min-h-[80px]
                flex items-center justify-between
                bg-white rounded-full shadow-elev
            ">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3 tablet:gap-0 tablet:w-[300px] h-full tablet:justify-between">
                    {/* LOGO */}
                    <div
                        className="
                            relative
                            w-[40px] h-[40px]
                            tablet:w-[50px] tablet:h-[50px]
                            md:w-[55px] md:h-[55px]
                            lg:w-[60px] lg:h-[60px]
                            xl:w-[65px] xl:h-[65px]
                            desk:w-[70px] desk:h-[70px]
                            flex-shrink-0
                        "
                    >
                        <Image
                            src="/assets/header/logo.svg"
                            alt="Lala Catering Logo"
                            fill
                            className="object-contain cursor-pointer"
                            onClick={() => router.push("/")}
                        />
                    </div>

                    {/* NAVIGATION - Desktop */}
                    <nav className="hidden tablet:flex tablet:w-[110px] sm:w-[130px] md:w-[150px] desk:w-[170px] items-center justify-between">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={item.href === "/" ? handleHomeClick : undefined}
                                className={`
                                    text-xs tablet:text-base md:text-md lg:text-lg xl:text-xl desk:text-base
                                    font-medium font-century-gothic-regular hover:text-gray-600 transition-colors whitespace-nowrap
                                    ${pathname === item.href ? "text-[#002683] font-bold" : "text-[#002683]"}
                                `}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* RIGHT SIDE */}
                <div className="
                    flex items-center justify-end gap-2 tablet:gap-3 md:gap-3 lg:gap-4 xl:gap-4 desk:gap-4
                    tablet:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[230px] desk:w-[250px]
                ">
                    {/* CUSTOMER SUPPORT - Hidden on mobile */}
                    <div className="
                        hidden tablet:block
                        relative
                        w-[20px] h-[20px]
                        tablet:w-[22px] tablet:h-[22px]
                        md:w-[24px] md:h-[24px]
                        lg:w-[26px] lg:h-[26px]
                        xl:w-[28px] xl:h-[28px]
                        desk:w-[30px] desk:h-[30px]
                    ">
                        <Image
                            src="/assets/header/customersupport.svg"
                            alt="Customer Support Icon"
                            fill
                            className="object-contain cursor-pointer"
                        />
                    </div>

                    {/* SIGN IN/OUT BUTTON */}
                    <div className="h-full rounded-full flex items-center justify-center">
                        {isLoggedIn ? (
                            <div className="relative">
                                <button onClick={() => setMenuOpen(!menuOpen)}>
                                    <HiOutlineUserCircle className="w-10 h-10 tablet:w-14 tablet:h-14 text-[#002683] cursor-pointer hover:text-[#E5713A] transition-colors" />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 w-44 bg-white text-black rounded-lg shadow-lg border py-2 z-50 flex flex-col">
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
                                className="
                                    px-3 py-1.5 tablet:px-4 tablet:py-1.5 md:px-5 md:py-2 lg:px-5 lg:py-2 xl:px-6 xl:py-2 desk:px-6 desk:py-2
                                    text-white rounded-full bg-[#E5713A]
                                    text-xs tablet:text-base md:text-md lg:text-lg xl:text-xl
                                    font-century-gothic-bold hover:bg-gray-800 transition-colors whitespace-nowrap h-full
                                "
                            >
                                SIGN IN
                            </Link>
                        )}
                    </div>

                    {/* HAMBURGER MENU - Mobile only */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="tablet:hidden text-[#002683] p-1"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <HiX className="w-6 h-6" />
                        ) : (
                            <HiMenu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU DROPDOWN */}
            {mobileMenuOpen && (
                <div className="tablet:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-lg border py-3 z-50">
                    <nav className="flex flex-col">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => {
                                    if (item.href === "/") handleHomeClick(e);
                                    setMobileMenuOpen(false);
                                }}
                                className={`
                                    px-6 py-3 text-base font-medium font-century-gothic-regular
                                    hover:bg-gray-100 transition-colors
                                    ${pathname === item.href ? "text-[#002683] font-bold bg-gray-50" : "text-[#002683]"}
                                `}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
