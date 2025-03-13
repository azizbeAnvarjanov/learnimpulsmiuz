"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { supabase } from "@/app/supabaseClient";
import { CircleFadingPlus, FileText, Trash } from "lucide-react";
import Link from "next/link";
import { Label } from "./ui/label";
import Image from "next/image";

export default function UploadPPT({ topicId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log(notes);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("ppts")
        .eq("topic_id", topicId)
        .single();

      if (error) {
        toast.error("Fayllarni olishda xatolik!");
      } else {
        try {
          setNotes(data.ppts);
        } catch {
          setNotes([]);
        }
      }
    };

    fetchNotes();
  }, [topicId]);

  const handleFileUpload = async () => {
    setLoading(true);
    if (!file || !fileName) {
      setLoading(false);
      toast.error("Fayl va nomni kiriting!");
      return;
    }

    const filePath = `ppts/${topicId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from("ppts")
      .upload(filePath, file);
    if (error) {
      toast.error("Fayl yuklashda xatolik!");
      return;
    }

    const { publicURL } = supabase.storage.from("ppts").getPublicUrl(filePath);
    const fileUrl = `${
      supabase.storage
        .from("ppts")
        .getPublicUrl(`ppts/${topicId}/${file.name}`).data.publicUrl
    }`;
    const newNote = { name: fileName, url: fileUrl };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);

    const { error: updateError } = await supabase
      .from("topics")
      .update({ ppts: updatedNotes }) // JSON.stringify kerak emas
      .eq("topic_id", topicId);

    if (updateError) {
      setLoading(false);
      toast.error("Maʼlumotlar bazasini yangilashda xatolik!");
    } else {
      setLoading(false);
      toast.success("Fayl muvaffaqiyatli yuklandi!");
    }

    setIsOpen(false);
    setFile(null);
    setFileName("");
  };

  const handleDelete = async (name) => {
    const note = notes.find((n) => n.name === name);
    if (!note) return;

    try {
      // Fayl yo‘lini URL dan chiqarib olish
      const fileUrl = new URL(note.url);
      const filePath = decodeURIComponent(`ppts/${topicId}/${name}`);
      console.log(filePath);

      const decodedUrl = decodeURIComponent(fileUrl); // URL ni dekodlash
      const parts = decodedUrl.split("/"); // URL bo‘laklarga ajratish
      const fileName = parts[parts.length - 1];

      // Faylni Supabase storage dan o‘chirish
      const { error: deleteError } = await supabase.storage
        .from("ppts")
        .remove([`ppts/${topicId}/${fileName}`]);

      if (deleteError) {
        console.error("Fayl o‘chirishda xatolik:", deleteError);
        toast.error("Faylni o‘chirishda xatolik!");
        return;
      }

      // `notes` array dan o‘chirib, ma’lumotlar bazasini yangilash
      const updatedNotes = notes.filter((n) => n.name !== name);
      setNotes(updatedNotes);

      const { error: updateError } = await supabase
        .from("topics")
        .update({ ppts: updatedNotes }) // JSON.stringify kerak emas
        .eq("topic_id", topicId);

      if (updateError) {
        console.error("DB yangilash xatosi:", updateError);
        toast.error("Maʼlumotlar bazasini yangilashda xatolik!");
      } else {
        toast.success("Fayl o‘chirildi!");
      }
    } catch (err) {
      console.error("Xatolik yuz berdi:", err);
      toast.error("Faylni o‘chirishda xatolik!");
    }
  };

  return (
    <div className="w-full">
      <Button className="rounded-xl" variant="ppt" onClick={() => setIsOpen(true)}>
        PPT qo‘shish <CircleFadingPlus size={28} />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fayl yuklash</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Fayl nomi</Label>
            <Input
              placeholder="Fayl nomi"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <div>
            <Label>Fileni tanlang</Label>
            <Input
              type="file"
              accept=".ppt,.pptx"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <Button  onClick={handleFileUpload} disabled={loading}>{`${
            loading ? "Yuklanmoqda...." : "Yuklash"
          }`}</Button>
        </DialogContent>
      </Dialog>
      <ul>
        {notes?.map((note, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 bg-white mt-2 p-3 rounded-md"
          >
            <div className="flex items-center gap-2">
              <div className="w-[30px] h-[40px] relative">
                <Image
                  fill
                  src={"/ppt.png"}
                  className="object-contain"
                  alt=""
                />
              </div>
              <Link href={note.url} className="font-medium">
                {note.name}
              </Link>
            </div>
            <div>
              <Button
                onClick={() => handleDelete(note.name)}
                variant="destructive"
                className="w-[40px] h-[40px] rounded-xl"
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
}
