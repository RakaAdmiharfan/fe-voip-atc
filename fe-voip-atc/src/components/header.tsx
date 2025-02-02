"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { IoIosSettings } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
import Cookies from "universal-cookie";

const Header: React.FC = () => {
  const router = useRouter();
  const cookies = new Cookies();
  const role = cookies.get("role");
  return (
    <header className="flex justify-between items-center bg-white border-b-2 border-[#EDEEF3] w-[98%] mx-auto p-6 md:p-10">
      {/* Left Side: Welcome Text */}
      <div>
        <h1 className="text-sm md:text-2xl font-semibold text-gray-800">
          Welcome back, {role == "manager" ? "Admin" : "Data Entry"}!
        </h1>
        <p className="text-[9px] md:text-sm text-gray-600">
          Lacak dan kelola data pengguna perusahaan kamu.
        </p>
      </div>

      {/* Right Side: Icons */}
      <div className="flex items-center space-x-5">
        {/* Settings Icon */}
        {role == "manager" && (
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => router.push("/admin/kustomisasi")}
          >
            <IoIosSettings className="text-sm md:text-xl" />
          </button>
        )}

        {/* Notification Icon */}
        <button className="text-gray-600 hover:text-gray-800">
          <IoNotifications className="text-sm md:text-xl" />
        </button>
      </div>
    </header>
  );
};

export default Header;
