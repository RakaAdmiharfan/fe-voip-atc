"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import TextField from "@/components/textfield";
import Button from "@/components/button";
import Toast from "@/components/toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Username dan password wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/register", {
        username,
        password,
      });

      if (response.status === 200) {
        router.push("/login");
      } else {
        setErrorMessage(response.data.message || "Registrasi gagal.");
      }
    } catch (err: unknown) {
      console.error("Register Error:", err);
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.message || "Terjadi kesalahan saat register."
        );
      } else {
        setErrorMessage("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Register
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Welcome! Please sign up for your account.
        </p>

        {errorMessage && (
          <Toast
            type="error"
            title="Register Failed"
            description={errorMessage}
            onClick={() => setErrorMessage("")}
          />
        )}

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
