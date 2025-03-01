"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/services/api"; // Pastikan kamu punya fungsi POST ke backend
import { UserAgent, URI } from "sip.js";
import Toast from "@/components/toast";
import TextField from "@/components/textfield";
import Link from "next/link";
import Button from "@/components/button";

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
      // const response = await post("/auth/login", { username, password });
      // console.log(response);
      // if (response.status !== 200) {
      //   setIsError(true);
      //   return;
      // }

      // const { sipConfig } = response.data;
      const sipConfig = {
        username: "user7@gmail.com",
        password: "user7@gmail.com",
        domain: "16.78.90.15",
        wss: "wss://16.78.90.15:5060"
      };
      console.log("SIP Config:", sipConfig);

      // Registrasi SIP.js ke Asterisk
      const userAgent = new UserAgent({
        uri: new URI("sip", sipConfig.username, sipConfig.domain),
        transportOptions: {
          server: sipConfig.wss,
        },
        authorizationUsername: sipConfig.username,
        authorizationPassword: sipConfig.password,
      });
      await userAgent.start(); // Registrasi ke Asterisk
      console.log("SIP Registered!");

      router.push("/dashboard"); // Redirect setelah login sukses
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
          description={"Pastikan semua field terisi dengan benar."}
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
          onChange={(val) => setUsername(val.target.value)}
        />
        <TextField
          name="password"
          type="password"
          placeholder="Masukkan password"
          label="Password"
          value={password}
          onChange={(val) => setPassword(val.target.value)}
        />
        <p className="text-[#535862] text-[10px] md:text-[14px] font-normal my-3 md:my-6">
          Doesn't Have an Account?{" "}
          <Link href="/register" className="text-blue-500 font-medium hover:underline">
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
