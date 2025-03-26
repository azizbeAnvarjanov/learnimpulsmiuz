"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardNavbar from "../DashboardNavbar";
import CourseEditors from "@/components/CourseEditors";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState("");
  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user);
      if (user.role === "student") {
        router.push("/"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
      }
    } else {
      router.push("/login"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
    }
  }, []);

  const [courseName, setCourseName] = useState("");
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [kurs, setKurs] = useState("1-kurs");

  const fetchCourses = async () => {
    if (!user) return; // Agar foydalanuvchi fio bo‘lmasa, hech narsa qilinmaydi
    setLoading(true);
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: true });

    if (error) {
      console.error("Kurslarni yuklashda xatolik:", error);
    } else {
      setLoading(false);
      setCourses(data);
    }
  };

  useEffect(() => {
    fetchCourses(); // Dastlabki yuklash

    const channel = supabase
      .channel("realtime:courses")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "courses" },
        fetchCourses // Har yangi qo‘shilgan kursda qayta yuklash
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Component unmount bo‘lganda obunani to‘xtatish
    };
  }, [user]); // Foydalanuvchi ismi-familiyasi o‘zgarsa qayta ishlaydi

  const handleFileChange = (event) => {
    setBanner(event.target.files[0]);
  };

  const generateCourseId = (name) => {
    return Math.floor(100000000 + Math.random() * 900000000);
  };

  const handleAddCourse = async () => {
    if (!courseName || !banner) return alert("Please fill all fields");

    setLoading(true);
    const courseId = generateCourseId(courseName);

    // Upload banner to Supabase Storage
    const { data, error } = await supabase.storage
      .from("banners")
      .upload(`banners/${courseId}/${banner.name}`, banner);

    if (error) {
      setLoading(false);
      return alert("Error uploading banner");
    }

    const bannerUrl = `${
      supabase.storage
        .from("banners")
        .getPublicUrl(`banners/${courseId}/${banner.name}`).data.publicUrl
    }`;

    if (insertError) {
      setLoading(false);
      return toast.error("Error adding course");
    }

    setLoading(false);
    toast.success("Course added successfully");
    setCourseName("");
    setBanner(null);
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="p-5">
        <Skeleton className="w-[200px] h-[10px] rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <div className="py-5 space-y-3">
            <Skeleton className="w-[250px] h-[125px] rounded-lg" />
            <Skeleton className="w-[180px] h-[10px] rounded-lg" />
            <Skeleton className="w-[150px] h-[10px] rounded-lg" />
            <Skeleton className="w-[120px] h-[10px] rounded-lg" />
          </div>
          <div className="py-5 space-y-3">
            <Skeleton className="w-[250px] h-[125px] rounded-lg" />
            <Skeleton className="w-[180px] h-[10px] rounded-lg" />
            <Skeleton className="w-[150px] h-[10px] rounded-lg" />
            <Skeleton className="w-[120px] h-[10px] rounded-lg" />
          </div>
          <div className="py-5 space-y-3">
            <Skeleton className="w-[250px] h-[125px] rounded-lg" />
            <Skeleton className="w-[180px] h-[10px] rounded-lg" />
            <Skeleton className="w-[150px] h-[10px] rounded-lg" />
            <Skeleton className="w-[120px] h-[10px] rounded-lg" />
          </div>
          <div className="py-5 space-y-3">
            <Skeleton className="w-[250px] h-[125px] rounded-lg" />
            <Skeleton className="w-[180px] h-[10px] rounded-lg" />
            <Skeleton className="w-[150px] h-[10px] rounded-lg" />
            <Skeleton className="w-[120px] h-[10px] rounded-lg" />
          </div>
          <div className="py-5 space-y-3">
            <Skeleton className="w-[250px] h-[125px] rounded-lg" />
            <Skeleton className="w-[180px] h-[10px] rounded-lg" />
            <Skeleton className="w-[150px] h-[10px] rounded-lg" />
            <Skeleton className="w-[120px] h-[10px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNavbar />
      <div className="p-10">
        <div className="w-full">
          <h2 className="text-lg font-bold">Fanlar</h2>
          <div className="grid grid-cols-5 gap-5">
            {courses.map((course) => (
              <Link
                href={`/dashboard/course/${course.course_id}`}
                key={course.id}
                className="border mt-3 gap-3 shadow-xl rounded-lg hover:bg-muted"
              >
                <img
                  src={course.banner_url}
                  alt={course.name}
                  className="w-full h-[200px] object-cover rounded-t-md"
                />
                <div className="p-4">
                  <p className="font-bold text-xl">{course.name}</p>
                  <p>
                    <strong>Author:</strong> {course.teacher}
                  </p>
                  <p>
                    <strong>Kurs:</strong> {course.kurs}
                  </p>
                  <p></p>
                </div>
                
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
