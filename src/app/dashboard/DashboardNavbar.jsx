"use client";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setuser] = useState(null);

  const logOutF = () => {
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
    <div className="w-full overflow-hidden h-[8vh] border flex items-center text-sm justify-between md:justify-start gap-5 px-5">
      {user?.role !== "student" && (
        <Link
          className={`hover:bg-muted py-2 px-4 border rounded-xl ${
            pathname === "/dashboard" ? "bg-blue-500 text-white" : ""
          }`}
          href="/dashboard"
        >
          Fan baza
        </Link>
      )}
      {user?.role === "Super Admin" && (
        <Link
          className={`hover:bg-muted py-2 px-4 border rounded-xl ${
            pathname === "/dashboard/all-courses"
              ? "bg-blue-500 text-white"
              : ""
          }`}
          href="/dashboard/all-courses"
        >
          Hamma fanlar
        </Link>
      )}
      {user?.role === "Employee" && (
        <Link
          className={`hover:bg-muted py-2 px-4 border rounded-xl ${
            pathname === "/dashboard/applications"
              ? "bg-blue-500 text-white"
              : ""
          }`}
          href="/dashboard/applications"
        >
          Arizalar
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

      <Button onClick={logOutF} variant="destructive">
        <LogOut />
      </Button>
    </div>
  );
};

export default Navbar;
