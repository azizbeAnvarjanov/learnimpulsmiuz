"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/supabaseClient";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  CircleFadingPlus,
  FileText,
  PencilLine,
  RefreshCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import UpdateCourseName from "@/components/UpdateCourseName";

export default function CoursePage() {
  const params = useParams();
  const course_id = params.courseId;

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit_open, setEdit_Open] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newBanner, setNewBanner] = useState(null);

  useEffect(() => {
    if (course_id) {
      fetchCourse();
      fetchTopics();
    }

    const channel = supabase
      .channel("realtime:topics")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "topics",
          filter: `course_id=eq.${course_id}`,
        },
        () => {
          fetchTopics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [course_id]);

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("course_id", course_id)
      .single();
    if (!error) setCourse(data);
    if (course) {
    }
  };

  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("course_id", course_id);
    if (!error) setTopics(data);
  };

  const generateTopicId = () => {
    return Math.floor(100000000 + Math.random() * 900000000);
  };

  const handleAddTopic = async () => {
    if (!topicName || !description) return alert("Please fill all fields");
    setLoading(true);

    const topic_id = generateTopicId();

    const { error: insertError } = await supabase.from("topics").insert([
      {
        course_id,
        topic_id,
        name: topicName,
        description,
        notes: [],
        video_link: videoLink,
      },
    ]);

    if (insertError) {
      setLoading(false);
      return alert("Error adding topic");
    }

    setLoading(false);
    setTopicName("");
    setDescription("");
    setVideoLink("");
    setOpen(false);
  };

  const handleEditClick = async (topicId) => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("topic_id", topicId)
      .order("order", { ascending: true }) // Tartib bo‘yicha saralash
      .single();
    if (error) {
      console.error("Error fetching topic:", error);
      return;
    }
    setEditingTopic(data.topic_id);
    setTopicName(data.name);
    setDescription(data.description);
    setVideoLink(data.video_link);
    setEdit_Open(true);
  };

  const handleUpdate = async () => {
    if (!editingTopic) return;
    const { error } = await supabase
      .from("topics")
      .update({
        name: topicName,
        description,
        video_link: videoLink,
      })
      .eq("topic_id", editingTopic);
    if (error) {
      console.error("Error updating topic:", error);
      return;
    }
    setEditingTopic("");
    setTopicName("");
    setDescription("");
    setVideoLink("");
    setEdit_Open(false);
  };

  // 🔹 Kurs bannerini yangilash funksiyasi
  const updateCourseBanner = async () => {
    console.log(course);
    if (!newBanner) {
      toast.error("Yangi rasm tanlang!");
      return;
    }

    setIsUpdating(true);

    // 1️⃣ Eski rasm URL'dan fayl nomini ajratib olish
    if (course.banner_url) {
      const decodedUrl = decodeURIComponent(course.banner_url); // URL ni dekodlash
      const parts = decodedUrl.split("/"); // URL bo‘laklarga ajratish
      const bannerName = parts[parts.length - 1];
      if (bannerName) {
        await supabase.storage
          .from("banners")
          .remove([`banners/${course.course_id}/${bannerName}`]);
      }
    }

    // 2️⃣ Yangi rasmni yuklash
    const filePath = `banners/${course.course_id}/${newBanner.name}`;
    const { data, error } = await supabase.storage
      .from("banners")
      .upload(filePath, newBanner);

    if (error) {
      toast.error("Yangi rasm yuklashda xatolik!");
      setIsUpdating(false);
      return;
    }

    // 3️⃣ Yangi URL'ni olish
    const { data: publicUrlData } = supabase.storage
      .from("banners")
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      toast.error("Rasm URL'sini olishda xatolik!");
      setIsUpdating(false);
      return;
    }

    // 4️⃣ Kursni yangilash
    const { error: updateError } = await supabase
      .from("courses")
      .update({ banner_url: publicUrlData.publicUrl })
      .eq("id", course.id);

    if (updateError) {
      toast.error("Kurs bannerini yangilashda xatolik!");
    } else {
      toast.success("Kurs banneri yangilandi!");
      fetchCourse();
    }

    setIsUpdating(false);
  };

  const sortingTopics = topics.sort((a, b) => a.order - b.order); // order bo‘yicha saralash

  if (!course) return <p>Loading...</p>;

  return (
    <div className="flex items-start">
      <div className="w-[65%] p-5">
        <UpdateCourseName course={course} />
        {/* 🔹 Banner */}
        <img
          src={course.banner_url}
          alt={course.name}
          className="w-full h-[600px] object-cover mt-4 rounded-xl"
        />

        {/* 🔹 Bannerni o‘zgartirish */}
        <div className="mt-4 flex gap-2">
          <Input
            type="file"
            onChange={(e) => setNewBanner(e.target.files[0])}
          />
          <Button onClick={updateCourseBanner} disabled={isUpdating}>
            Rasmni yangilash
          </Button>
        </div>
      </div>

      <div className="w-[35%] p-5">
        <div className="flex items-center gap-1">
          <strong className="mr-2">Mavzular </strong>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-[40px] h-[40px] rounded-xl"
                variant="outline"
              >
                <CircleFadingPlus />
              </Button>
            </DialogTrigger>
            <DialogTitle></DialogTitle>
            <DialogContent>
              <Input
                type="text"
                placeholder="Mavzu nomi"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Mavzu tafsifi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Video havolasi"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
              <Button onClick={handleAddTopic} disabled={loading}>
                {loading ? "Yaratilmoqda..." : "Mavzu yaratish"}
              </Button>
            </DialogContent>
          </Dialog>
          <Button
            className="w-[40px] h-[40px] rounded-xl"
            variant="outline"
            onClick={fetchTopics}
          >
            <RefreshCcw />
          </Button>
        </div>
        <Dialog open={edit_open} onOpenChange={setEdit_Open}>
          <DialogTrigger asChild>
            <Button
              className="hidden w-[45px] h-[45px] rounded-xl"
              variant="outline"
            >
              <CircleFadingPlus />
            </Button>
          </DialogTrigger>
          <DialogTitle></DialogTitle>
          <DialogContent>
            <h1>Ma'lumotlarni tahrirlash</h1>
            <Input
              type="text"
              placeholder="Mavzu nomi"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Mavzu tafsifi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Video havolasi"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
            />
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Yaratilmoqda..." : "Mavzu yaratish"}
            </Button>
          </DialogContent>
        </Dialog>

        <br />
        <div>
          <ul>
            {sortingTopics.map((topic, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between border py-3 px-4 my-2 rounded-lg"
              >
                <div className="w-full">
                  <Link
                    href={`/dashboard/course/${course_id}/topic/${topic.topic_id}`}
                    className="font-bold"
                  >
                    {topic.name} - {topic.order}
                  </Link>

                  <p className="line-clamp-1 w-[90%]">{topic.description}</p>
                </div>
                <div className="flex items-center text-blue-500">
                  <div className="flex items-center gap-1">
                    <FileText />

                    <strong>{topic.notes.length}</strong>
                  </div>
                  <Button
                    variant="outline"
                    className="w-[35px] h-[35px] border ml-3"
                    onClick={() => handleEditClick(topic.topic_id)}
                  >
                    <PencilLine />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
