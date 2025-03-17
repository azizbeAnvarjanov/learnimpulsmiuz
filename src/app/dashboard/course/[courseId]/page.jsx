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
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Cookies from "js-cookie";

export default function CoursePage() {
  const params = useParams();
  const course_id = params.courseId;

  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);

  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [topicOrder, setTopicOrder] = useState(0);
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit_open, setEdit_Open] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newBanner, setNewBanner] = useState(null);

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
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
        order: topicOrder,
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
    setTopicOrder(data.order);
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

  if (!course)
    return (
      <div className="flex flex-col md:flex-row items-start max-h-screen overflow-hidden">
        <div className="player-thumb w-full md:w-[75%] overflow-y-scroll scrollbar-hide max-h-screen">
          <div className="flex items-center justify-between md:justify-start md:gap-3 p-3">
            <Skeleton className="w-[40px] h-[40px] rounded-xl" />
            <Skeleton className="w-[140px] h-[15px] rounded-xl" />
            <Skeleton className="md:hidden w-[40px] h-[40px] rounded-xl " />
          </div>
          <div className="w-full h-[300px] md:h-[700px] overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="p-3 space-y-3">
            <Skeleton className="w-full mx-auto h-[100px] rounded-xl" />
            <Skeleton className="w-full mx-auto h-[100px] rounded-xl" />
            <Skeleton className="w-full mx-auto h-[100px] rounded-xl" />
          </div>
        </div>
        <div className="w-full hidden md:block md:w-[25%] h-[100vh] border-l player-thumb overflow-y-scroll">
          <div className="flex items-center gap-1 p-3 justify-between">
            <Skeleton className="w-[140px] h-[15px] rounded-xl" />
            <Skeleton className="w-[40px] h-[40px] rounded-xl" />
          </div>
          <div className="">
            <Skeleton className="w-full h-[50px] border border-white rounded-none" />
            <Skeleton className="w-full h-[50px] border border-white rounded-none" />
            <Skeleton className="w-full h-[50px] border border-white rounded-none" />
            <Skeleton className="w-full h-[50px] border border-white rounded-none" />
            <Skeleton className="w-full h-[50px] border border-white rounded-none" />
            <Skeleton className="w-full h-[50px] border border-white rounded-none" />
            <Skeleton className="w-full h-[50px] border border-white rounded-none" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex items-start">
      <div className="w-[75%] ">
        {course.teacher === user.login ? (
          <>
            <UpdateCourseName course={course} />
          </>
        ) : (
          <div className="text-2xl font-bold flex items-center gap-2 p-2">
            <Link
              href={`/dashboard`}
              className="bg-white border flex items-center justify-center hover:bg-muted w-[45px] h-[40px] rounded-xl"
            >
              <ChevronLeft />
            </Link>
            <p>{course.name}</p>
          </div>
        )}
        {/* 🔹 Banner */}
        <img
          src={course.banner_url}
          alt={course.name}
          className="w-full h-[700px] object-cover border-t border-b"
        />

        {course.teacher === user.login && (
          <>
            {/* 🔹 Bannerni o‘zgartirish */}
            <div className="p-3 flex gap-2">
              <Input
                className="w-[200px]"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => setNewBanner(e.target.files[0])}
              />
              <Button onClick={updateCourseBanner} disabled={isUpdating}>
                Rasmni yangilash
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="w-[25%] border-l min-h-[100vh] overflow-y-scroll player-thumb">
        <div className="flex items-center gap-1 border-b p-2">
          <strong className="mr-2">Mavzular </strong>

          {course.teacher === user.login && (
            <>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-[100px] h-[40px] rounded-xl">
                    Yaratish <CircleFadingPlus />
                  </Button>
                </DialogTrigger>
                <DialogTitle></DialogTitle>
                <DialogContent>
                  <h1 className="font-bold">Yangi fan yaratish</h1>

                  <div>
                    <Label>Mavzu tartib raqami</Label>
                    <Input
                      type="number"
                      placeholder="Mavzu tartib raqami"
                      value={topicOrder}
                      onChange={(e) => setTopicOrder(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Mavzu nomi</Label>
                    <Input
                      type="text"
                      placeholder="Mavzu nomi"
                      value={topicName}
                      onChange={(e) => setTopicName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Mavzu tafsifi</Label>

                    <Input
                      type="text"
                      placeholder="Mavzu tafsifi"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Video havolasi</Label>

                    <Input
                      type="text"
                      placeholder="Video havolasi"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddTopic} disabled={loading}>
                    {loading ? "Yaratilmoqda..." : "Mavzu yaratish"}
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Button
            className="w-[40px] h-[40px] rounded-xl"
            variant="outline"
            onClick={fetchTopics}
          >
            <RefreshCcw />
          </Button>
        </div>

        {course.teacher === user.login && (
          <>
            <Dialog open={edit_open} onOpenChange={setEdit_Open}>
              <DialogTrigger asChild>
                <Button
                  className="hidden w-[45px] h-[45px] rounded-xl"
                  variant="outline"
                >
                  <CircleFadingPlus />
                </Button>
              </DialogTrigger>
              <DialogTitle className="hidden"></DialogTitle>
              <DialogContent>
                <h1 className="font-bold">Ma'lumotlarni tahrirlash</h1>
                <div>
                  <Label>Mavzu tarib raqami</Label>
                  <Input
                    type="number"
                    placeholder="Mavzu tarib raqami"
                    value={topicOrder}
                    onChange={(e) => setTopicOrder(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mavzu nomi</Label>

                  <Input
                    type="text"
                    placeholder="Mavzu nomi"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mavzu tafsifi</Label>

                  <Textarea
                    type="text"
                    placeholder="Mavzu tafsifi"
                    className="h-[20vh]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Video havolasi</Label>

                  <Input
                    type="text"
                    placeholder="Video havolasi"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? "Yaratilmoqda..." : "Mavzu yaratish"}
                </Button>
              </DialogContent>
            </Dialog>
          </>
        )}

        <div className="">
          <ul className="grid gap-2 p-2">
            {sortingTopics.map((topic, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between border rounded-md py-2 px-2"
              >
                <div className="w-[90%]">
                  <Link
                    href={`/dashboard/course/${course_id}/topic/${topic.topic_id}`}
                    className="font-bold ml-2 line-clamp-1"
                  >
                    {topic.order}. {topic.name}
                  </Link>
                </div>
                {course.teacher === user.login && (
                  <>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        className="w-[35px] h-[35px] border"
                        onClick={() => handleEditClick(topic.topic_id)}
                      >
                        <PencilLine />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
