// components/Header.tsx
"use client";
import React, { useState } from "react";
import { LuLogOut } from "react-icons/lu";
import ModalApprove from "./modal-approval";
import { postWithAuth } from "@/app/api/(auth)/login/route";
import Cookies from "universal-cookie";
import { useRouter } from "next/navigation";

const HeaderUser: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const cookies = new Cookies();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogOut = async () => {
    const token = cookies.get("token");
    setIsLoading(true);

    try {
      await postWithAuth("logout", {}, token);
      cookies.remove("token", { path: "/", sameSite: "lax", secure: true });
      cookies.remove("user_id", { path: "/", sameSite: "lax", secure: true });
      cookies.remove("role", { path: "/", sameSite: "lax", secure: true });
      
      router.push("/login");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="flex justify-between items-center bg-white border-b-2 border-[#EDEEF3] w-[98%] mx-auto px-10 py-9">
      {showModal && (
        <ModalApprove
          image="/modal/logout-icon.svg"
          title="Log out Account"
          subtitle="Apakah kamu yakin ingin log out dari akun ini?"
          button1Text="Cancel"
          button2Text="Ya"
          button1Color="bg-[#FFFFFF]"
          button1TextColor="text-[#414651]"
          button2Color="bg-[#D92D20]"
          button2TextColor="text-[#FFFFFF]"
          onButton1Click={() => setShowModal(false)}
          onButton2Click={() => handleLogOut()}
          loading={isLoading}
        />
      )}

      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, User!
        </h1>
      </div>

      <div className="flex items-center space-x-5">
        <button
          onClick={() => {
            setShowModal(true);
          }}
        >
          <LuLogOut className="text-lg text-gray-600 ml-8" />
        </button>
      </div>
    </header>
  );
};

export default HeaderUser;
