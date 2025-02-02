"use client";
import Button from "@/components/button";
import TextField from "@/components/textfield";
import Toast from "@/components/toast";
import { get, put } from "@/services/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function Register({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get("customization/current");
        const data = response.data.data;
      } catch (error) {
        console.error("Error fetching customization data:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      username: username,
      password: password,
    };
    setIsLoading(true);

    try {
      const response = await put(`complete-register/${id}`, data);
      if (response.status === 200) {
        router.push("/login");
        toast.success("Register Berhasil.");
      } else {
        setIsError(true);
        console.error(response.data);
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[url('/assets/background.png')] bg-cover flex flex-col justify-center items-center gap-6">
      {isPageLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm font-medium">Loading...</p>
          </div>
        </div>
      )}
      <div className={`${isError ? "block" : "hidden"}`}>
        <Toast
          type={"error"}
          title={"Gagal Register"}
          description={"Pastikan semua field terisi dengan benar."}
          onClick={() => setIsError(false)}
        />
      </div>
      <div className="w-auto h-auto flex flex-col items-center bg-white rounded-[20px] drop-shadow-2xl shadow-[#0A0D1224] p-5 md:p-6">
        <Image
          src={"null"}
          alt={"Logo"}
          className="w-12 h-12"
          width={12}
          height={12}
        />
        <p className="text-[#181D27] text-[24px] md:text-[30px] font-semibold mt-6">
          Register
        </p>
        <p className="text-[#535862] text-[12px] md:text-[16px] font-normal mt-3 mb-6 md:mb-8">
          Welcome! Please sign up your account.
        </p>
        <TextField
          name={"username"}
          type={"field"}
          placeholder={"Masukkan username"}
          label={"Username"}
          value={username}
          onChange={(val) => setUsername(val.target.value)}
        />
        <TextField
          name={"password"}
          type={"password"}
          placeholder={"Masukkan password"}
          label={"Password"}
          value={password}
          onChange={(val) => setPassword(val.target.value)}
        />
        <Button
          text={"Register"}
          type={"submit"}
          onClick={handleLogin}
          isLoading={isLoading}
        />
      </div>
      <div className={`${isError ? "invisible" : "hidden"}`}>
        <Toast
          type={"error"}
          title={"Gagal Register"}
          description={"Pastikan semua field terisi dengan benar."}
        />
      </div>
    </div>
  );
}
