"use client"
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const TestingPage = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kurs ID sini shu yerga kiriting (yoki URL params dan oling)
  const courseId = 244747901;

  useEffect(() => {
    async function fetchCourseWithTopics() {
      const { data, error } = await supabase
        .from("courses")
        .select("*, topics(*)")
        .eq("course_id", courseId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setCourse(data);
      }
      setLoading(false);
    }

    fetchCourseWithTopics();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log(course);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{course.name}</h1>

      <h2 className="text-xl font-semibold mt-4">Mavzular:</h2>
      <ul className="list-disc pl-5">
        {course.topics.length > 0 ? (
          course.topics.map((topic) => (
            <li key={topic.id} className="mt-2">
              <strong>{topic.name}:</strong>
            </li>
          ))
        ) : (
          <p>Mavzular yo'q</p>
        )}
      </ul>
    </div>
  );
};

export default TestingPage;
