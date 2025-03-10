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
      <div className="flex items-center w-full justify-center min-h-screen bg-[#eeeeee]">
        <div className="flex flex-col-reverse md:flex-row w-[800px] md:shadow-lg rounded-2xl overflow-hidden">
          {/* Left Section - Login Form */}
          <div className="w-[90%] lg:w-1/2 rounded-xl mx-auto bg-white p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-center">Kirish</h2>
            <p className="text-sm text-gray-500 text-center">
              Talaba sifatida tizimga kirish!
            </p>

            <div className="bg-white mt-3 rounded-lg">
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
                className="mt-3 text-center flex w-full justify-center text-gray-500 my-4"
              >
                Xodim sifatida kirish
              </Link>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="w-1/2 bg-gradient-to-br from-purple-500 hidden md:block h-[500px] to-indigo-500 items-center justify-center relative">
            <div className="absolute w-[100%] h-[100%] bg-white rounded-xl flex items-center justify-center shadow-lg">
              <img
                src="/student.jpg"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
