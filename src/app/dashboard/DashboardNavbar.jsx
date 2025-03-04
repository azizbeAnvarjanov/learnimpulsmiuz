"use client";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const DashboardNavbar = () => {
  const pathname = usePathname();
  const [user, setuser] = useState(null);

  const logOut = () => {
    Cookies.remove("user"); // Cookie o‘chirish
    router.push("/login"); // Login sahifasiga yo‘naltirish
  };

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      setuser(JSON.parse(userData)); // Cookie'dan ma'lumotni olish va holatga saqlash
    }
  }, []);

  return (
    <div className="w-full h-[8vh] border flex items-center justify-center gap-5">
      <Link
        className={`hover:bg-muted py-2 px-4 border rounded-xl ${
          pathname === "/all-courses" ? "bg-blue-500 text-white" : ""
        }`}
        href="/all-courses"
      >
        Hamma kurslar
      </Link>
      {user?.role !== "Student" && (
        <Link
          className={`hover:bg-muted py-2 px-4 border rounded-xl ${
            pathname === "/dashboard" ? "bg-blue-500 text-white" : ""
          }`}
          href="/dashboard"
        >
          Dashboard
        </Link>
      )}
      <Link
        className={`hover:bg-muted py-2 px-4 border rounded-xl ${
          pathname === "/dashboard/my-profile" ? "bg-blue-500 text-white" : ""
        }`}
        href="/dashboard/my-profile"
      >
        Profilim
      </Link>
    </div>
  );
};

export default DashboardNavbar;
