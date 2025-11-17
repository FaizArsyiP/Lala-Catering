"use client";

import Image from "next/image";

export const todayMenu = () => {
    return (
        <section
            className="relative w-full min-h-screen overflow-hidden bg-[#002683] flex flex-col items-center justify-center px-[15vw] pt-24"
        >
            {/* CURVED TOP OVERLAY */}
            <div className="pointer-events-none absolute top-0 left-0 w-full z-[30]">
                <svg
                    viewBox="0 0 1440 240"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    className="tablet:h-[10vh] md:h-[20vh] lg:h-[50vh] w-full"
                >
                    <path
                        fill="#FFFFFF"
                        d="M0,240 C360,0 1080,0 1440,240 L1440,0 L0,0 Z"
                    />
                </svg>
            </div>

            {/* CONTENT */}
            <div className="w-full flex flex-col items-center justify-center z-[40]">
                <h1 className="text-white font-stanger text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-10">
                    Menu Pilihan Hari Ini
                </h1>

                {/* MENU CARD */}
                <div
                    className="w-full max-w-[1140px] flex sm:flex-col md:flex-row items-center bg-white rounded-[48px] shadow-md overflow-hidden"
                >
                    {/* LEFT IMAGE BLOCK */}
                    <div className="relative w-full md:w-[30%] h-[220px] flex items-center justify-center shrink-0">

                        {/* HALF-HEIGHT BLUE CHECKERBOARD */}
                        <div className="absolute top-0 left-0 w-1/2 h-full bg-[url('/assets/landing/todayMenu.svg')] bg-cover bg-center" />

                        {/* CIRCLE IMAGE */}
                        <div className="relative z-20 w-[160px] h-[160px] rounded-full overflow-hidden shadow-xl border-4 border-white">
                            <Image
                                src="/assets/hero/hero1.png"
                                alt="Dish"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* RIGHT TEXT */}
                    <div className="flex flex-col justify-center flex-1 text-center md:text-left px-6 py-10">
                        <h2 className="text-3xl font-century-gothic-bold text-[#002683] mb-3">
                            Nasi Ayam Bali
                        </h2>
                        <p className="text-gray-700 font-century-gothic-regular text-lg leading-relaxed max-w-full">
                            Nasi ayam bali ala warmindo Sami Asih pogung, dilengkapi dengan nasi jeruk serta sayuran berupa selada dan tomat segar.
                            Dibuat dengan bumbu tradisional Bali yang kaya rempah.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default todayMenu;
