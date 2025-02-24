"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AdminPage = () => {
  const router = useRouter();
  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== "Super Admin") {
        router.push("/"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
      }
    } else {
      router.push("/login"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
    }
  }, []);

  return <div>AdminPage</div>;
};

export default AdminPage;
