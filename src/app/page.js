"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [kurs, setKurs] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourses = async (selectedKurs) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("kurs", selectedKurs);

    if (error) {
      console.error("Kurslarni yuklashda xatolik:", error);
      setLoading(false);
    } else {
      setCourses(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setKurs(parsedUser.kurs);
      fetchCourses(parsedUser.kurs);
    }
  }, []);
  useEffect(() => {
    if (user) {
      if (user.role !== "student") {
        router.push("/dashboard"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
      }
    }
  }, [user]);

  const handleKursChange = (event) => {
    const selectedKurs = event.target.value;
    setKurs(selectedKurs);
    fetchCourses(selectedKurs);
  };

  if (loading) {
    return (
      <div className="p-5">
        <Skeleton className="w-[200px] h-[10px] rounded-full" />
        <div className="py-3 flex items-center gap-3">
          <Skeleton className="w-[80px] h-[25px] rounded-lg" />
          <Skeleton className="w-[80px] h-[25px] rounded-lg" />
          <Skeleton className="w-[80px] h-[25px] rounded-lg" />
          <Skeleton className="w-[80px] h-[25px] rounded-lg" />
          <Skeleton className="w-[80px] h-[25px] rounded-lg" />
          <Skeleton className="w-[80px] h-[25px] rounded-lg" />
        </div>
        <br />
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
    <div className="p-5">
      <h2 className="text-lg font-bold mb-4">Kurslarni Tanlang</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {["1", "2", "3", "4", "5", "6"].map((num) => (
          <Label
            key={num}
            className={`flex items-center gap-2 border py-2 px-4 rounded-xl cursor-pointer hover:bg-blue-500 hover:text-white transition-all ${
              kurs === `${num}-kurs` ? "bg-blue-500 text-white shadow-xl" : "border-dashed"
            }`}
          >
            <Input
              type="radio"
              name="kurs"
              value={`${num}-kurs`}
              checked={kurs === `${num}-kurs`}
              onChange={handleKursChange}
              className="hidden"
            />
            {num}-kurs
          </Label>
        ))}
      </div>

      <h2 className="text-lg font-bold">Fanlar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {courses.map((course) => (
          <Link
            href={`/course/${course.course_id}`}
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
              </p>
              <p>
                <strong>Kurs:</strong> {course.kurs}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
