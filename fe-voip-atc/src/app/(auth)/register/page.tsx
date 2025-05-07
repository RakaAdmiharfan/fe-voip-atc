"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import TextField from "@/components/textfield";
import Button from "@/components/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      toast.error("Username dan password wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/register", {
        username,
        password,
      });

      if (response.status === 200) {
        toast.success(response.data.message || "Registrasi Berhasil.");
        router.push("/login");
      } else {
        toast.error(response.data.message || "Registrasi gagal.");
      }
    } catch (err: unknown) {
      console.error("Register Error:", err);
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Terjadi kesalahan saat register."
        );
      } else {
        toast.error("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Register
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Welcome! Please sign up for your account.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <TextField
            name="username"
            type="field"
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            text="Register"
            isLoading={isLoading}
            color="black"
          />
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
