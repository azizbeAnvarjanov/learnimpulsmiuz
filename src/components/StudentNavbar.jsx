import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

const StudentNavbar = () => {
  const pathname = usePathname();
  const logOutF = () => {
    Cookies.remove("user"); // Cookie o‘chirish
    router.push("/login"); // Login sahifasiga yo‘naltirish
  };
  return (
    <div className="h-[8vh] flex items-center gap-2 px-5 border-b justify-between">
      <div className="flex items-center gap-3">
        <Link
          className={`border py-1 px-5 rounded-md ${
            pathname === "/" ? "bg-blue-500 text-white" : ""
          }`}
          href={"/"}
        >
          Fanlar
        </Link>
        <Link
          className={`border py-1 px-5 rounded-md ${
            pathname === "/applications" ? "bg-blue-500 text-white" : ""
          }`}
          href={"/applications"}
        >
          Ariza topshirish
        </Link>
      </div>
      <Button onClick={logOutF} variant="destructive">
        <LogOut />
      </Button>
    </div>
  );
};

export default StudentNavbar;
