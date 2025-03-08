"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    setError("");

    // Bazadan talabaning ID va parolini tekshiramiz
    const { data, error } = await supabase
      .from("students") // `students` jadvali
      .select("*")
      .eq("talaba_id", studentId)
      .eq("seria", password)
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
  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (user) {
        router.push("/");
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Talaba Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <Input
          type="text"
          placeholder="Talaba ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
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
          href="/employeesLogin"
          className="mt-3 text-center flex w-full justify-center"
        >
          Xodim sifatida kirish
        </Link>
      </div>
    </div>
  );
}
