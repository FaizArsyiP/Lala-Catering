"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export const HeroSection = () => {
    const router = useRouter();

    return (
        <section
            className="
                relative w-full overflow-hidden bg-[#002683]
                flex flex-col lg:flex-row
                items-center
                justify-start lg:justify-between
                px-[15vw] pt-4 pb-16
            "
        >
            {/* CURVED BOTTOM OVERLAY */}
            <div
                className="
                    pointer-events-none
                    absolute left-0 bottom-[-1px]
                    z-[30] w-full
                "
            >
                <svg
                    viewBox="0 0 1440 240"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    className="tablet:h-[10vh] md:h-[20vh] lg:h-[50vh] w-full"
                >
                    <path
                        fill="#FFFFFF"
                        d="M0,0 C360,240 1080,240 1440,0 L1440,240 L0,240 Z"
                    />
                </svg>
            </div>

            {/* HERO IMAGE */}
            <div
                className="
                    relative z-[40]
                    w-full lg:w-[55%]
                    h-[42vh] sm:h-[48vh] md:h-[52vh] lg:h-[60vh] xl:h-[70vh]
                "
            >
                <Image
                    src="/assets/hero/hero1.png"
                    alt="Hero"
                    fill
                    className="
                        object-contain
                        object-left
                        rounded-t-[80px]
                    "
                    priority
                />
            </div>

            {/* TEXT CONTENT */}
            <div
                className="
                    z-[40]
                    mt-4 lg:mt-0                 
                    lg:ml-10
                    flex flex-col gap-3
                    max-w-[500px]               
                    space-y-1.5                 
                    text-white
                "
            >
                <h1
                    className="
                        font-century-gothic-bold
                        leading-tight
                        text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                    "
                >
                    Rasa <span className="text-[#FF8C42]">Rumah</span> di{" "}
                    Setiap <span className="text-[#FF8C42]">Sajian</span>
                </h1>

                <p
                    className="
                        font-century-gothic-regular
                        leading-snug
                        text-sm sm:text-base md:text-lg
                    "
                >
                    Masakan rumahan segar setiap hari dari dapur Bu Lala
                </p>

                <button
                    className="
                        w-fit rounded-full
                        bg-[#FF8C42]
                        px-6 py-2 sm:px-8 sm:py-3
                        text-sm sm:text-base md:text-lg
                        font-century-gothic-bold
                        text-white
                        transition-colors hover:bg-[#ff7a28]
                        cursor-pointer
                    "
                    onClick={() => router.push("/menu")}
                >
                    Lihat Menu
                </button>
            </div>
        </section>
    );
};

export default HeroSection;
