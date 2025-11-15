"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
    { label: "HOME", href: "/"},
    { label: "MENU", href: "/menu"},
]

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        router.refresh();
    }

    return (
        <header className="w-full
                        xs:hidden tablet:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] xl:min-h-[160px] desk:min-h-[180px]
                        flex items-center justify-center">
            
            {/* CONTENTS CONTAINER */}
            <div className="w-full
                            xs:px-[15px] tablet:px-[20px] md:px-[25px] lg:px-[28px] xl:px-[29px] desk:px-[30px]
                            xs:py-[5px] tablet:py-[7px] md:py-[8px] lg:py-[9px] xl:py-[9px] desk:py-[10px]
                            xs:min-h-[40px] tablet:min-h-[50px] md:min-h-[60px] lg:min-h-[70px] xl:min-h-[80px] desk:min-h-[90px]
                            flex items-center justify-between
                            bg-white rounded-full">

                {/* LEFT SIDE */}
                <div className="w-[300px]
                               h-full flex items-center justify-between">
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
                    <nav className="xs:hidden tablet:w-[110px] sm:w-[130px] md:w-[150px] desk:w-[170px] flex items-center justify-between">
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
                    <div className="relative 
                                    xs:w-[20px] xs:h-[20px]
                                    tablet:w-[22px] tablet:h-[22px]
                                    md:w-[24px] md:h-[24px]
                                    lg:w-[26px] lg:h-[26px]
                                    xl:w-[28px] xl:h-[28px]
                                    desk:w-[30px] desk:h-[30px]">
                        <Image
                            src="/assets/header/customersupport.svg"
                            alt="Customer Support Icon"
                            fill
                            className="object-contain cursor-pointer"
                        />
                    </div>
                    
                    {/* SIGN IN/OUT BUTTON */}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="xs:px-3 xs:py-1.5 tablet:px-4 tablet:py-1.5 md:px-5 md:py-2 lg:px-5 lg:py-2 xl:px-6 xl:py-2 desk:px-6 desk:py-2
                                     text-white rounded-full 
                                      xs:text-xs tablet:text-base md:text-md lg:text-lg xl:text-xl
                                      font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                        >
                            Profile
                        </button>
                    ) : (
                        <Link
                            href="/signin"
                            className="xs:px-3 xs:py-1.5 tablet:px-4 tablet:py-1.5 md:px-5 md:py-2 lg:px-5 lg:py-2 xl:px-6 xl:py-2 desk:px-6 desk:py-2
                                     text-white rounded-full 
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