"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import TextField from "@/components/textfield";
import Button from "@/components/button";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const redirectTo = from && from !== "/login" ? from : "/contact";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/api/login", { username, password });
      const { sipConfig, message } = res.data;

      if (!sipConfig) throw new Error("SIP config missing from response");
      localStorage.setItem("sipConfig", JSON.stringify(sipConfig));
      toast.success(message || "Login berhasil");

      window.location.href = redirectTo; // gunakan full reload agar cookie terbaca di server
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error.message || "Login gagal";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          router.replace(redirectTo);
        }
      } catch {
        // do nothing
      }
    };
    checkAlreadyLoggedIn();
  }, []);

  useEffect(() => {
    if (searchParams.get("unauth") === "1") {
      toast.warn("Silakan login terlebih dahulu");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">Login</h2>
        <p className="text-center text-gray-500 mb-6">
          Welcome back! Please enter your credentials.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
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
            text="Log In"
            isLoading={isLoading}
            color="black"
          />
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
