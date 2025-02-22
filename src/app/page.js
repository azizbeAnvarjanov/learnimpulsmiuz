"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const logOut = () => {
    Cookies.remove("user"); // Cookie o‘chirish
    router.push("/login"); // Login sahifasiga yo‘naltirish
  };
  const [user, setuser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      setuser(JSON.parse(userData)); // Cookie'dan ma'lumotni olish va holatga saqlash
    } else {
      router.push("/login"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
    }
  }, []);

  if (!user) return <p>Yuklanmoqda...</p>;

  return (
    <>
      <div className="p-6">
        {user && (
          <>
            {user.role === "student" ? (
              <>
                <h1 className="text-2xl font-bold">
                  Xush kelibsiz, {user.fio}!
                </h1>
                <p>FIO: {user.fio}</p>
                <p>ID: {user.talaba_id}</p>
                <p>Guruh: {user.guruh}</p>
                <p>Seria: {user.seria}</p>
                <p>Role: {user.role}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">
                  Xush kelibsiz, {user.fio}!
                </h1>
                <p>FIO: {user.fio}</p>
                <p>Login: {user.login}</p>
                <p>Role: {user.role}</p>
              </>
            )}
          </>
        )}

        <button
          onClick={logOut}
          className="mt-4 bg-red-500 text-white p-2 rounded"
        >
          Chiqish
        </button>
      </div>
    </>
  );
}
