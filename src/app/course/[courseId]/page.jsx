"use client";

import { useState, useEffect } from "react";
import "../../globals.css";
import { useParams } from "next/navigation";
import { supabase } from "@/app/supabaseClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpenCheck,
  ChevronLeft,
  Paperclip,
  RefreshCcw,
  SquareArrowOutUpRight,
  Video,
} from "lucide-react";
import ReactPlayer from "react-player";
import { toast } from "react-hot-toast";
import TopicsSheet from "@/components/TopicSheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CoursePage() {
  const params = useParams();
  const course_id = params.courseId;

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);

  useEffect(() => {
    if (course_id) {
      fetchCourse();
      fetchTopics();
    }
  }, [course_id]);

  const fetchCourse = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("course_id", course_id)
      .single();

    setLoading(false);

    if (!error) setCourse(data);
  };

  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("course_id", course_id)
      .order("order", { ascending: true });
    if (!error && data.length > 0) {
      setTopics(data);
      setSelectedTopic(data[0]);
      fetchFiles(data[0].topic_id);
      fetchTest(data[0].topic_id);
    }
  };

  const fetchFiles = async (topic_id) => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("topic_id", topic_id);
    if (!error) setFiles(data);
  };

  const fetchTest = async (topic_id) => {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("topic_id", topic_id)
      .single();
    if (!error) {
      setTest(data);
    } else {
      setTest(null);
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    fetchFiles(topic.topic_id);
    fetchTest(topic.topic_id);
  };




  if (loading)
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
    <div className="flex flex-col md:flex-row items-start max-h-screen overflow-hidden">
      <div className="player-thumb w-full md:w-[75%] overflow-y-scroll scrollbar-hide max-h-screen">
        <div className="flex items-center justify-between md:justify-start md:gap-3 p-3">
          <Link
            href={`/`}
            className="bg-white border flex items-center justify-center hover:bg-muted w-[40px] h-[40px] rounded-xl"
          >
            <ChevronLeft />
          </Link>
          <h1 className="font-bold text-[15px] md:text-2xl">{course.name}</h1>
          <TopicsSheet
            course_id={course_id}
            selectedTopic={selectedTopic}
            handleTopicClick={handleTopicClick}
            test={test}
          />
        </div>

        <div className="w-full h-[300px] md:h-[700px] overflow-hidden">
          {selectedTopic?.video_link && (
            <ReactPlayer
              url={selectedTopic.video_link}
              controls
              width="100%"
              height="100%"
            />
          )}
        </div>

        <div className="p-3">
          <div className="border bg-muted p-5 rounded-lg">
            <h1 className="font-bold">Mavzu tafsivi</h1>
            {selectedTopic?.description}{" "}
          </div>
        </div>
      </div>
      <div className="w-full hidden md:block md:w-[25%] h-[100vh] border-l player-thumb overflow-y-scroll">
        <div className="flex items-center gap-1 p-3 justify-between">
          <strong className="mr-2">Mavzular</strong>
          <Button
            className="w-[40px] h-[40px] rounded-xl"
            variant="outline"
            onClick={fetchTopics}
          >
            <RefreshCcw />
          </Button>
        </div>
        <Accordion type="single" collapsible>
          {topics.map((topic, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx + 1}`}
              onClick={() => handleTopicClick(topic)}
              className="cursor-pointer"
            >
              <AccordionTrigger className="px-4">
                {topic.order}. {topic.name}
              </AccordionTrigger>
              <AccordionContent className="bg-muted p-2 space-y-1">
                <div
                  className={`flex items-center gap-2 border p-3 rounded-lg ${
                    selectedTopic?.topic_id === topic.topic_id
                      ? "bg-green-300"
                      : "bg-white"
                  }`}
                >
                  <Video /> <h1 className="font-bold">{topic.name}</h1>
                </div>
                {selectedTopic?.notes.map((file, idx) => (
                  <Link
                    target="_blank"
                    className="flex items-center gap-2 border p-3 rounded-lg bg-white hover:bg-muted"
                    href={`${file.url}`}
                    key={idx}
                  >
                    <Paperclip />
                    <h1 className="font-bold">{file.name}</h1>
                  </Link>
                ))}
                {test !== null && (
                  <Link
                    href={`/test/${test.id}`}
                    className="flex hover:bg-muted items-center gap-2 border p-3 rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpenCheck />
                      <h1 className="font-bold">{test.name}</h1>
                    </div>
                  </Link>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* {topics.map((topic, idx) => (
            <li
              key={idx}
              className={`flex items-center cursor-pointer justify-between border-t py-3 px-4 ${
                selectedTopic?.topic_id === topic.topic_id && "bg-green-300"
              }`}
              onClick={() => handleTopicClick(topic)}
            >
              <div className="w-full">
                <div>
                  {topic.order}. {topic.name}
                </div>
              </div>
            </li>
          ))} */}
      </div>
    </div>
  );
}
