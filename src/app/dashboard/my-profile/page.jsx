"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DashboardNavbar from "../DashboardNavbar";
import { supabase } from "@/app/supabaseClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newFio, setNewFio] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setNewFio(parsedUser.fio);
    } else {
      router.push("/login");
    }
  }, []);

  const logOut = () => {
    Cookies.remove("user");
    router.push("/employeesLogin");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("employees")
      .update({ fio: newFio, password: newPassword || user.password })
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      alert("Profilni yangilashda xatolik: " + error.message);
    } else {
      alert("Profil muvaffaqiyatli yangilandi!");
      setUser((prev) => ({ ...prev, fio: newFio }));
      setIsDialogOpen(false);
      logOut();
    }
  };

  if (!user) return <p>Yuklanmoqda...</p>;

  return (
    <>
      <DashboardNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold">Xush kelibsiz, {user.fio}!</h1>
        <p>FIO: {user.fio}</p>
        <p>Login: {user.login}</p>
        <p>Role: {user.role}</p>
        <p>Login: {user.login}</p>
        <p>Parol: {user.password}</p>

        <Button onClick={() => setIsDialogOpen(true)}>
          Profilni tahrirlash
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profilni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="mb-2">
            <Label className="block text-sm font-medium">FIO</Label>
            <Input
              type="text"
              className="border p-2 w-full"
              value={newFio}
              onChange={(e) => setNewFio(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <Label className="block text-sm font-medium">Yangi parol</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Yangilash"}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Bekor qilish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
