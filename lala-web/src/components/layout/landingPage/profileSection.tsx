"use client";

import Image from "next/image";

export const ProfileSection = () => {
    return (
        <section
            className="
                relative w-full bg-white
                min-h-screen
                flex flex-col items-center justify-start
                px-4 tablet:px-8
                z-[30]
            "
        >
            {/* TITLE 1 */}
            <h2
                className="
                    text-[#FF8C42]
                    text-2xl tablet:text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                    font-stanger text-center
                    mb-8 tablet:mb-10
                "
            >
                Mengapa Memilih Kami?
            </h2>

            {/* FEATURE CARDS */}
            <div
                className="
                    w-full max-w-[1140px]
                    flex flex-col md:flex-row
                    items-center justify-center
                    gap-8 md:gap-8
                    flex-grow
                "
            >
                {[
                    {
                        img: "/assets/icons/icon1.svg",
                        title: "Dimasak Segar\nSetiap Hari",
                        desc: "Bahan pilihan langsung dari\ndapur Bu Lala",
                    },
                    {
                        img: "/assets/icons/icon2.svg",
                        title: "Menu Berganti\nTiap Minggu",
                        desc: "Tidak bosan,\ntetap bergizi seimbang",
                    },
                    {
                        img: "/assets/icons/icon3.svg",
                        title: "Pesan\nFleksibel",
                        desc: "Cukup pesan H-1, makan\nsiangmu siap keesokan hari",
                    },
                ].map((c, index) => (
                    <div
                        key={index}
                        className="flex-1 flex flex-col items-center text-center max-w-[300px] w-full"
                    >
                        <div className="relative w-[90px] h-[90px] tablet:w-[110px] tablet:h-[110px] mb-3">
                            <Image
                                src={c.img}
                                alt={`Icon ${index}`}
                                fill
                                className="object-contain"
                            />
                        </div>

                        <h3
                            className="
                                text-[#FF8C42]
                                text-lg tablet:text-xl sm:text-2xl
                                font-century-gothic-bold
                                whitespace-pre-line
                                mb-1
                            "
                        >
                            {c.title}
                        </h3>

                        <p
                            className="
                                text-gray-800
                                text-sm tablet:text-base sm:text-lg
                                whitespace-pre-line
                                font-century-gothic-regular
                                leading-relaxed
                            "
                        >
                            {c.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* TITLE 2 */}
            <h2
                className="
                    text-[#FF8C42]
                    text-2xl tablet:text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                    font-stanger text-center
                    mt-10 tablet:mt-14 mb-4
                    px-4
                "
            >
                Bahan Segar,<br />Kualitas Terjamin
            </h2>

            {/* PARAGRAPH */}
            <p
                className="
                    text-gray-800
                    text-sm tablet:text-base sm:text-lg
                    text-center
                    max-w-[700px]
                    font-century-gothic-regular
                    leading-relaxed
                    px-4
                "
            >
                Kami memilih bahan yang terbaik,<br />
                diolah di dapur bu Lala, menjamin kualitas<br />
                makanan dengan gizi seimbang
            </p>
        </section>
    );
};

export default ProfileSection;
