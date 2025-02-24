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

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const course_id = params.courseId;

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
  };

  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("course_id", course_id);
    if (!error) setTopics(data);
  };

  const generateTopicId = (name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleAddTopic = async () => {
    if (!topicName || !description) return alert("Please fill all fields");
    setLoading(true);

    let fileUrls = [];
    for (let file of files) {
      const { data, error } = await supabase.storage
        .from("notes")
        .upload(`topics/${course_id}/${file.name}`, file);
      if (!error)
        fileUrls.push(
          `${
            supabase.storage
              .from("notes")
              .getPublicUrl(`topics/${course_id}/${file.name}`).data.publicUrl
          }`
        );
    }

    const topic_id = generateTopicId(topicName);

    const { error: insertError } = await supabase.from("topics").insert([
      {
        course_id,
        topic_id,
        name: topicName,
        description,
        notes: fileUrls,
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
    setFiles([]);
    setVideoLink("");
    setOpen(false);
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{course.name}</h1>
      <img
        src={course.banner_url}
        alt={course.name}
        className="w-full h-48 object-cover mt-4"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add New Topic</Button>
        </DialogTrigger>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <Input
            type="text"
            placeholder="Topic Name"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            type="file"
            multiple
            accept="application/pdf, application/msword"
            onChange={handleFileChange}
          />
          <Input
            type="text"
            placeholder="Video Link"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
          <Button onClick={handleAddTopic} disabled={loading}>
            {loading ? "Adding..." : "Add Topic"}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        <h2 className="text-lg font-bold">
          Topics <Button onClick={fetchTopics}>Refresh</Button>
        </h2>
        <ul>
          {topics.map((topic) => (
            <li key={topic.id} className="border p-2 my-2">
              <Link href={`/course/${course_id}/topic/${topic.topic_id}`} className="font-bold">{topic.name}</Link>
              <p>{topic.description}</p>
              {topic.video_link && (
                <a
                  href={topic.video_link}
                  target="_blank"
                  className="text-blue-500"
                >
                  Watch Video
                </a>
              )}
              <div>
                {topic.notes.map((note, index) => (
                  <a
                    key={index}
                    href={note}
                    target="_blank"
                    className="text-blue-500 block"
                  >
                    Note {index + 1}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
