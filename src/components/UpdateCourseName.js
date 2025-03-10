"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/app/supabaseClient";

export default function UpdateCourseName({ course }) {
  const [newName, setNewName] = useState(course.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newBanner, setNewBanner] = useState(null);
  // 🔹 Kurs nomini yangilash funksiyasi
  const updateCourseName = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("courses")
      .update({ name: newName })
      .eq("id", course.id);

    if (error) {
      toast.error("Kurs nomini yangilashda xatolik!");
    } else {
      toast.success("Kurs nomi yangilandi!");
    }
    setIsUpdating(false);
  };


  return (
    <div className="text-2xl font-bold flex items-center gap-2 p-2">
      <Link
        href={`/dashboard`}
        className="bg-white border flex items-center justify-center hover:bg-muted w-[45px] h-[40px] rounded-xl"
      >
        <ChevronLeft />
      </Link>
      <Input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="font-bold text-xl border-none shadow-none"
      />
      <Button onClick={updateCourseName} disabled={isUpdating}>
        Saqlash
      </Button>
    </div>
  );
}
