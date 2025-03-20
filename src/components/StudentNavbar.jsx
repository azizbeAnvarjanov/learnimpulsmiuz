import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { AlignJustify, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Cookies from "js-cookie";

const StudentNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const logOutF = () => {
    Cookies.remove("user"); // Cookie o‘chirish
    router.push("/login"); // Login sahifasiga yo‘naltirish
  };
  return (
    <div className="h-[8vh] flex items-center gap-2 px-5 border-b justify-between">
      <Link
        href={"/"}
        className="min-w-[40px] min-h-[40px] md:min-w-[50px] md:min-h-[50px] relative"
      >
        <Image fill src={"/logo.png"} alt="" className="object-contain" />
      </Link>
      <div className="hidden md:flex items-center gap-3">
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
      <Sheet className="relative">
        <SheetTrigger className="grid md:hidden ">
          <AlignJustify />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Ta'lim platformasi</SheetTitle>
            <SheetDescription className="space-y-1">
              <Link
                className={`border flex py-2 px-5 rounded-md ${
                  pathname === "/" ? "bg-blue-500 text-white" : ""
                }`}
                href={"/"}
              >
                Fanlar
              </Link>
              <Link
                className={`border flex py-2 px-5 rounded-md ${
                  pathname === "/applications" ? "bg-blue-500 text-white" : ""
                }`}
                href={"/applications"}
              >
                Ariza topshirish
              </Link>
              <Button
                onClick={logOutF}
                className="flex w-[96%] absolute bottom-2 left-[50%] -translate-x-[50%]"
                variant="destructive"
              >
                <LogOut />
              </Button>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Button
        className="hidden md:block"
        onClick={logOutF}
        variant="destructive"
      >
        <LogOut />
      </Button>
    </div>
  );
};

export default StudentNavbar;
