"use client";

import Image from "next/image";
import Header from "@/components/layout/header";
import Link from "next/link";
import axios from "axios";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        try {
            const token = credentialResponse.credential;

            if (!token) {
                throw new Error("No token received from Google");
            }
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/users/auth/google`,
                { token }
            );
            localStorage.setItem("token", res.data.token);
            router.push("/");
        } catch (error) {
            console.error("Google registration error:", error);
        }
    };
    const handleGoogleFailure = () => {
        console.error("Google registration failed");
    };

    return (
        <>
            <Header />
            <div className="min-h-[calc(100vh-120px)] bg-white flex items-center justify-center">
                <div className="w-[84.531vw] flex items-center justify-center">
                    {/* LEFT SIDE */}
                    <div className="text-black w-1/2 flex flex-col justify-center gap-4 p-4">
                        <h1 className="text-5xl font-bold ">
                            Create your account
                        </h1>
                        <p className="text-2xl mb-4 w-[560px]">
                            Nikmati kemudahan memesan menu favorit setiap minggu
                            hanya dengan sekali login.
                        </p>

                        {/* GOOGLE LOGIN */}
                        <div className="self-center  w-full h-full flex items-center justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleFailure}
                                width="100%"
                                size="large"
                                theme="outline"
                                text="signup_with"
                            />
                        </div>

                        <p className="text-xl self-center">
                            Sudah punya akun?{" "}
                            <Link
                                href="/login"
                                className="text-[#E5713A] 
                        relative inline-block
                        cursor-pointer
                        after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#E5713A]
                        after:transition-all after:duration-300 hover:after:w-full">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>

                    {/* IMAGE */}
                    <div className=" w-1/2 flex justify-center items-center">
                        <Image
                            src="/assets/register/Group 3.svg"
                            width={600}
                            height={600}
                            alt="register pic"
                            className="h-[70vh] w-full object-contain "
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
