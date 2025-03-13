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
import UploadPPT from "@/components/UploadPPT";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TopicPage = () => {
  const params = useParams();
  const topic_id = params.topic_id;
  const course_id = params.courseId;
  const [topic, setTopic] = useState(null);
  const [tests, setTests] = useState([]);
  const [testName, setTestName] = useState("");
  const [timeLimit, setTimeLimit] = useState(40);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(1);

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
  const fetchtest = async () => {
    const { data, error } = await supabase
      .from("tests")
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

  const handleAddTest = async () => {
    const { data, error } = await supabase
      .from("tests")
      .insert([
        { topic_id, name: testName, time_limit: timeLimit, questions: [] },
      ]);
    if (!error) {
      setIsTestModalOpen(false);
      setTestName("");
      fetchTests();
    }
  };

  const handleAddQuestion = async () => {
    const newQuestion = {
      question_id: Math.floor(100000 + Math.random() * 900000),
      question,
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      answer: options[correct - 1], // To'g'ri javob sifatida tanlangan variant qo'yiladi
    };

    const { data, error } = await supabase
      .from("tests")
      .update({
        questions: [
          ...tests.find((t) => t.id === selectedTestId).questions,
          newQuestion,
        ],
      })
      .eq("id", selectedTestId);

    if (!error) {
      setIsQuestionModalOpen(false);
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrect(0); // To'g'ri javobni reset qilish
      fetchTests();
    }
  };

  const handleDeleteQuestion = async (selectedTest, question_id) => {
    if (!question_id) {
      console.error("Error: question_id is null or undefined");
      return;
    }

    console.log("Deleting question with id:", question_id);

    if (!selectedTest || !selectedTest.questions) {
      console.error("Error: Selected test or questions not found");
      return;
    }

    const updatedQuestions = selectedTest.questions.filter(
      (q) => q.question_id !== question_id
    );

    console.log(selectedTest.id);

    const { data, error } = await supabase
      .from("tests")
      .update({
        questions: updatedQuestions,
      })
      .eq("id", selectedTest.id);

    if (!error) {
      console.log("Savol muvaffaqiyatli o‘chirildi:", question_id);
      fetchTests(); // Yangilanishi uchun testlarni qayta yuklaymiz
    } else {
      console.error("Error deleting question:", error);
    }
  };

  const uploadFile = async (topicId, file) => {
    if (!file) return { error: "No file selected" };

    const filePath = `notes/${file.name}`;

    const { data, error } = await supabase.storage
      .from("notes")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file:", error);
      return { error };
    }

    const publicUrl = supabase.storage.from("notes").getPublicUrl(filePath).data
      .publicUrl;

    return { name: file.name, link: publicUrl };
  };

  const handleCheckboxChange = (idx) => {
    if (correct === idx) {
      setCorrect(null); // Agar tanlangan checkbox yana bosilsa, to'g'ri javobni o'chirish
    } else {
      setCorrect(idx); // Yangi variantni to'g'ri javob qilib belgilash
    }
  };
  if (!topic)
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
    <div className="flex">
      <div className="w-[75%] border-r min-h-[100vh] overflow-y-scroll player-thumb">
        <div className=" text-2xl font-bold flex items-center gap-2 p-2">
          <Link
            href={`/dashboard/course/${course_id}`}
            variant="outline"
            className="bg-white border  flex items-center justify-center hover:bg-muted w-[40px] h-[40px] rounded-xl"
          >
            <ChevronLeft />
          </Link>
          <h1 className="line-clamp-1">{topic.name}</h1>
        </div>
        <div className="w-full h-[600px] overflow-hidden border-b">
          {topic.video_link && (
            <ReactPlayer
              url={topic.video_link}
              controls
              width="100%"
              height="100%"
            />
          )}
        </div>
        <div className="p-3">
          <div className="bg-muted p-3 border">
            <strong>Mavzu tafsifi</strong>
            <p>{topic.description}</p>
          </div>
          <div className="bg-muted p-3 border ">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                {/* Fayl yuklash inputi */}
                <TopicFiles topicId={topic_id} />
              </div>
              <div className="flex items-center gap-2">
                {/* Fayl yuklash inputi */}
                <UploadPPT topicId={topic_id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[25%]">
        <div className="flex items-center gap-2 border-b p-2">
          <h2 className="text-lg font-bold">Testlar</h2>
          <Button
            className="w-fit h-[40px] px-4 py-0 text-sm rounded-xl"
            onClick={() => setIsTestModalOpen(true)}
          >
            Yaratish
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
                className="flex items-center rounded-xl"
                onClick={() => {
                  setSelectedTestId(test.id);
                  setIsQuestionModalOpen(true);
                }}
              >
                Savol qo'shish <CircleFadingPlus />
              </Button>
            </div>
            <div className="min-h-[100vh] overflow-y-scroll player-thumb">
              {test.questions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg shadow-md mb-3 flex items-center justify-between"
                >
                  <div className="flex items-center justify-between w-[90%]">
                    <h3 className="font-bold line-clamp-1">{item.question}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <EditQuestionDialog
                      testId={test.id}
                      questionId={item.question_id}
                      tests={tests}
                      setTests={setTests}
                    />
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleDeleteQuestion(test, item.question_id)
                      }
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Test qo'shish modali */}

      <Dialog open={isTestModalOpen} onClose={() => setIsTestModalOpen(false)}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Yangi test yaratish</h2>
              <Input
                placeholder="Test Name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Time Limit (minutes)"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />

              <div className="flex items-center gap-2">
                <Button onClick={handleAddTest}>Yaratish</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsTestModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Savol qo'shish modali */}

      <Dialog
        open={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
      >
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Savol qo'shish</h2>
              <Input
                placeholder="Savol"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx + 1}
                  <Input
                    placeholder={`Variant ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[idx] = e.target.value;
                      setOptions(newOptions);
                    }}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 items-center gap-2">
                <h1>To'g'ri variant tartib raqami:</h1>
                <Select defaultValue={correct} onValueChange={setCorrect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="To'gri variant tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAddQuestion}>Qo'shish</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsQuestionModalOpen(false)}
                >
                  Bekor qilish
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicPage;
