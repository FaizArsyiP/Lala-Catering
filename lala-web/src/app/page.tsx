"use client";

import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/layout/landingPage/heroSection";
import { ProfileSection } from "@/components/layout/landingPage/profileSection";
import { todayMenu as TodayMenu } from "@/components/layout/landingPage/todayMenu";

export default function HomePage() {
    return (
         <main className="w-full min-h-screen bg-[#002683]">
            <Header />
            <HeroSection />
            <ProfileSection />
            <TodayMenu />
        </main>
    );
}
