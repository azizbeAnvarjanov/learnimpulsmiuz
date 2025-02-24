"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supabase } from "./supabaseClient";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [kurs, setKurs] = useState("");

  const fetchCourses = async (selectedKurs) => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("kurs", selectedKurs);

    if (error) {
      console.error("Kurslarni yuklashda xatolik:", error);
    } else {
      setCourses(data);
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

  const handleKursChange = (event) => {
    const selectedKurs = event.target.value;
    setKurs(selectedKurs);
    fetchCourses(selectedKurs);
  };

  return (
    <div className="p-10">
      <h2 className="text-lg font-bold mb-4">Kurslarni Tanlang</h2>
      <div className="flex gap-2 mb-6">
        {["1", "2", "3", "4", "5", "6"].map((num) => (
          <label
            key={num}
            className={`flex items-center gap-2 border py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-500 hover:text-white ${
              kurs === `${num}-kurs` ? "bg-blue-500 text-white shadow-xl" : ""
            }`}
          >
            <input
              type="radio"
              name="kurs"
              value={`${num}-kurs`}
              checked={kurs === `${num}-kurs`}
              onChange={handleKursChange}
              className="hidden"
            />
            {num}-kurs
          </label>
        ))}
      </div>

      <h2 className="text-lg font-bold">Courses</h2>
      <div className="grid grid-cols-2 gap-5">
        {courses.map((course) => (
          <Link
            href={`/course/${course.course_id}`}
            key={course.id}
            className="border py-2 px-3 mt-10 flex items-center gap-3 shadow-xl rounded-lg hover:bg-muted"
          >
            <img
              src={course.banner_url}
              alt={course.name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div>
              <p className="font-bold text-xl">{course.name}</p>
              <p>
                <strong>Author:</strong> {course.teacher}
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
