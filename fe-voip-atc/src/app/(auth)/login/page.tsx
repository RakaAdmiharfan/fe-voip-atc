"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserAgent, URI, Registerer } from "sip.js";
import Toast from "@/components/toast";
import TextField from "@/components/textfield";
import Link from "next/link";
import Button from "@/components/button";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);

    try {
      // Send login request to the backend
      const response = await axios.post("/api/login", { username, password });

      // Check if response is valid and contains sipConfig
      if (response.status !== 200) {
        throw new Error("Invalid credentials");
      }

      const { sipConfig } = response.data;

      // Log the response data to see if sipConfig is included
      console.log("Backend Response:", response.data);

      if (!sipConfig) {
        throw new Error("Missing SIP configuration in the response");
      }

      console.log("SIP Config:", sipConfig);

      // ✅ Validasi SIP URI sebelum digunakan
      const uri = UserAgent.makeURI(
        `sip:${sipConfig.username}@${sipConfig.domain}`
      );
      if (!uri) {
        throw new Error("Invalid SIP URI");
      }

      // ✅ Pastikan transport WSS valid
      if (!sipConfig.wss) {
        throw new Error("Invalid WebSocket server");
      }

      // ✅ Buat SIP UserAgent
      const userAgent = new UserAgent({
        uri,
        transportOptions: { server: sipConfig.wss },
        authorizationUsername: sipConfig.username,
        authorizationPassword: sipConfig.password,
      });

      // ✅ Pastikan userAgent bisa connect sebelum register
      await userAgent.start();
      if (!userAgent.isConnected()) {
        throw new Error("Failed to connect SIP UserAgent");
      }

      // ✅ Gunakan Registerer untuk melakukan registrasi
      const registerer = new Registerer(userAgent);
      await registerer.register();

      console.log("SIP Registered!");
      router.push("/contact"); // Redirect setelah sukses
    } catch (error) {
      console.error("Login Failed:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#1e1f22] bg-cover flex flex-col justify-center items-center gap-6">
      {isError && (
        <Toast
          type={"error"}
          title={"Gagal Login"}
          description={"Login Failed"}
          onClick={() => setIsError(false)}
        />
      )}

      <div className="w-auto h-auto flex flex-col items-center bg-white rounded-[20px] drop-shadow-2xl shadow-[#0A0D1224] p-5 md:p-6">
        <p className="text-gray-950 text-[24px] md:text-[30px] font-bold mt-3">
          Login
        </p>
        <p className="text-[#535862] text-[12px] md:text-[16px] font-normal mt-3 mb-6 md:mb-8">
          Welcome back! Please enter your details.
        </p>
        <TextField
          name="username"
          type="field"
          placeholder="Masukkan username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          name="password"
          type="password"
          placeholder="Masukkan password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-[#535862] text-[10px] md:text-[14px] font-normal my-3 md:my-6">
          Doesn't Have an Account?{" "}
          <Link
            href="/register"
            className="text-blue-500 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
        <Button
          text="Log in"
          type="submit"
          onClick={handleLogin}
          isLoading={isLoading}
          color="black"
        />
      </div>
    </div>
  );
}
