"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import TextField from "@/components/textfield";
import Button from "@/components/button";
import Toast from "@/components/toast";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/login", { username, password });
      const { sipConfig } = response.data;

      if (!sipConfig) throw new Error("Invalid SIP configuration from backend");

      // ✅ Simpan ke localStorage (biar bisa dipakai oleh useSip di layout setelah login)
      localStorage.setItem("sipConfig", JSON.stringify(sipConfig));

      // ✅ Arahkan user ke halaman dashboard (yang di dalam VoIPProvider)
      router.push("/contact");
    } catch (error: any) {
      console.error("Login Error:", error);
      setErrorMessage(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">Login</h2>
        <p className="text-center text-gray-500 mb-6">
          Welcome back! Please enter your credentials.
        </p>

        {errorMessage && (
          <Toast
            type="error"
            title="Login Failed"
            description={errorMessage}
            onClick={() => setErrorMessage("")}
          />
        )}

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
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
