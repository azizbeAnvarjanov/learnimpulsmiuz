import { NextResponse } from "next/server";

export function middleware(req) {
  // Foydalanuvchi login qilganmi yoki yo'qmi tekshiramiz
  const user = req.cookies.get("user"); // Cookie'dan foydalanuvchi ma'lumotini olish

  const loginUrl = new URL("/login", req.url);
  const dashboardUrl = new URL("/", req.url);

  // Agar foydalanuvchi login qilmagan bo‘lsa va login sahifasida bo‘lmasa, login sahifasiga yo‘naltiramiz
  if (!user && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(loginUrl);
  }

  // Agar foydalanuvchi login qilgan bo‘lsa va login sahifasiga kirmoqchi bo‘lsa, uni dashboard sahifasiga yo‘naltiramiz
  if (user && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Middleware faqat shu sahifalar uchun ishlaydi
export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/arizalar",
    "/test/:path*",
    "/dashboard/:path*",
    "/course/:path*",
    "/my-profile",
    "/admin",
  ],
};
