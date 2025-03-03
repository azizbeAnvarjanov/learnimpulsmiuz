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
  const [testName, setTestName] = useState("");
  const [timeLimit, setTimeLimit] = useState(40);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);

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

  if (!topic) return <p>Loading...</p>;

  return (
    <div className="p-5 flex gap-4">
      <div className="w-[65%]">
        <div className=" text-2xl font-bold flex items-center gap-2">
          <Link
            href={`/dashboard/course/${course_id}`}
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
            <div>
              {test.questions.map((item, idx) => (
                <div key={idx} className="p-3 border rounded-lg shadow-md mb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{item.question}</h3>
                    <div className="text-green-600 font-semibold">
                      To'g'ri javob: {item.answer}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-2 ">
                    {[
                      item.optionA,
                      item.optionB,
                      item.optionC,
                      item.optionD,
                    ].map((option, idx) => (
                      <div
                        key={idx}
                        className={`text-center border p-2 rounded-md ${
                          option === item.answer
                            ? "bg-green-100 font-semibold"
                            : ""
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleDeleteQuestion(test, item.question_id)
                      }
                    >
                      <Trash />
                    </Button>
                    <EditQuestionDialog
                      testId={test.id}
                      questionId={item.question_id}
                      tests={tests}
                      setTests={setTests}
                    />
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
                placeholder="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              {options.map((opt, idx) => (
                <Input
                  key={idx}
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[idx] = e.target.value;
                    setOptions(newOptions);
                  }}
                />
              ))}
              <Input
                type="number"
                placeholder="Correct Answer (0-3)"
                value={correct}
                onChange={(e) => setCorrect(parseInt(e.target.value, 10))}
              />
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
