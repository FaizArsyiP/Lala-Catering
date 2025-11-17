"use client";

import Header from "@/components/layout/header";
import { HeroSection } from "@/components/layout/landingPage/heroSection";
import { ProfileSection } from "@/components/layout/landingPage/profileSection";
import { todayMenu as TodayMenu } from "@/components/layout/landingPage/todayMenu";

export default function HomePage() {
    return (
<<<<<<< HEAD
        <main className="w-full min-h-screen bg-[#002683]">
            <Header />
            <HeroSection />
            <ProfileSection />
            <div className="flex justify-center items-center">
              <TodayMenu />
=======
        <main className="overflow-x-hidden w-screen h-screen bg-[#002683] flex justify-center items-center">
            {/* COMPONENTS CONTAINER */}
            <div
                className="w-full h-full 
                            xs:mx-[30px] 
                            tablet:mx-[60px] 
                            md:mx-[80px] 
                            lg:mx-[100px] 
                            xl:mx-[130px] 
                            desk:mx-[150px]">
                {/* HEADER */}
                <div className="w-full">
                    <Header />
                </div>
>>>>>>> origin/main
            </div>
        </main>
    );
}
