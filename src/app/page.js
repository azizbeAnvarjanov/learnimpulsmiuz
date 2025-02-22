"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const logOut = () => {
    Cookies.remove("student"); // Cookie o‘chirish
    router.push("/login"); // Login sahifasiga yo‘naltirish
  };
  const [student, setStudent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const studentData = Cookies.get("student");
    if (studentData) {
      setStudent(JSON.parse(studentData)); // Cookie'dan ma'lumotni olish va holatga saqlash
    } else {
      router.push("/login"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
    }
  }, []);

  if (!student) return <p>Yuklanmoqda...</p>;

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Xush kelibsiz, {student.name}!</h1>
        <p>FIO: {student.fio}</p>
        <p>ID: {student.talaba_id}</p>
        <p>Guruh: {student.guruh}</p>
        <p>Seria: {student.seria}</p>
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
