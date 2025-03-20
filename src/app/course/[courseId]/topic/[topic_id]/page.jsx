"use client";
import { supabase } from "@/app/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  CircleFadingPlus,
  CirclePlus,
  FileText,
  Trash,
} from "lucide-react";
import EditQuestionDialog from "@/components/EditQuestionDialog";
import Link from "next/link";
import { toast } from "react-hot-toast";

import TopicFiles from "@/components/TopicFiles";

const TopicPage = () => {
  const params = useParams();
  const topic_id = params.topic_id;
  const course_id = params.courseId;
  const [topic, setTopic] = useState(null);
  const [tests, setTests] = useState([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  useEffect(() => {
    if (topic_id) {
      fetchTopic();
      fetchTests();
    }
  }, [topic_id]);

  const fetchTopic = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("topic_id", topic_id)
      .single();
    if (!error) setTopic(data);
  };


  const fetchTests = async () => {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("topic_id", topic_id);
    if (!error) setTests(data);
  };



  if (!topic) return <p>Loading...</p>;

  return (
    <div className="p-5 flex gap-4">
      <div className="w-[65%]">
        <div className=" text-2xl font-bold flex items-center gap-2">
          <Link
            href={`/course/${course_id}`}
            variant="outline"
            className="bg-white border  flex items-center justify-center hover:bg-muted w-[45px] h-[45px] rounded-xl"
          >
            <ChevronLeft />
          </Link>
          {topic.name}
        </div>
        <div className="w-full h-[600px] overflow-hidden rounded-xl mt-3">
          {topic.video_link && (
            <ReactPlayer
              url={topic.video_link}
              controls
              width="100%"
              height="100%"
            />
          )}
        </div>
        <div className="bg-muted p-3 border mt-4 rounded-xl">
          <strong>Mavzu tafsifi</strong>
          <p>{topic.description}</p>
        </div>
        <div className="bg-muted p-3 border mt-4 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              {/* Fayl yuklash inputi */}
              <TopicFiles topicId={topic_id} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 w-[35%]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Testlar</h2>
          <Button
            variant="outline"
            className="w-[45px] h-[45px] rounded-xl"
            onClick={() => setIsTestModalOpen(true)}
          >
            <CircleFadingPlus size={28} />
          </Button>
        </div>
        {tests.map((test) => (
          <div key={test.id} className=" p-2 my-2">
            <div className="flex items-center justify-between pb-5">
              <div>
                <p className="font-bold capitalize">{test.name}</p>
                <p>Test uchun ajratilgan vaqt: {test.time_limit} daqiqa</p>
              </div>
              <Button
                className="flex items-center"
                onClick={() => {
                  setSelectedTestId(test.id);
                  setIsQuestionModalOpen(true);
                }}
              >
                Savol <CircleFadingPlus />
              </Button>
            </div>

          </div>
        ))}
      </div>

      
    </div>
  );
};

export default TopicPage;
