"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowLeft, ChevronLeft } from "lucide-react";

const EmployeesLoigin = () => {
  const [login, setlogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");

    // Bazadan talabaning ID va parolini tekshiramiz
    const { data, error } = await supabase
      .from("employees") // `students` jadvali
      .select("*")
      .eq("login", login)
      .eq("password", password)
      .single();

    if (error || !data) {
      setError("ID yoki parol noto‘g‘ri!");
      return;
    }

    // Foydalanuvchini cookie'ga saqlaymiz (1 kun)
    Cookies.set("user", JSON.stringify(data), { expires: 1 });

    // Dashboard sahifasiga yo‘naltiramiz
    router.push("/");
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <div className="w-[80px] mb-2 h-[80px] mx-auto relative">
          <Image fill src={"/logo.png"} alt="" className="object-contain" />
        </div>
        <h2 className="text-xl text-center font-bold mb-4">
          Impuls ta'lim platofrmasi
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        <Input
          type="text"
          placeholder="Login"
          value={login}
          onChange={(e) => setlogin(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <Input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <Button
          onClick={handleLogin}
          className="w-full text-white py-2 rounded"
        >
          Kirish
        </Button>
        <Link
          href="/login"
          className="mt-3 text-center flex w-full justify-center"
        >
          Talaba sifatida kirish
        </Link>
      </div>
    </div>
  );
};

export default EmployeesLoigin;
