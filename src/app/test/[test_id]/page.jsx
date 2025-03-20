"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/app/supabaseClient";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const TestPlayingPage = () => {
  const params = useParams();
  const test_id = params.test_id;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (test_id) {
      fetchTest();
    }
  }, [test_id]);

  const fetchTest = async () => {
    const { data, error } = await supabase
      .from("tests")
      .select("questions")
      .eq("id", test_id)
      .single();

    if (!error && data?.questions) {
      setQuestions(data.questions);
    } else {
      console.error("Test topilmadi!");
    }
  };

  const handleAnswer = (questionId, selectedAnswer) => {
    setAnswers({ ...answers, [questionId]: selectedAnswer });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.question_id] === q.answer) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);
  };

  const restartTest = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return <p>Test yuklanmoqda yoki topilmadi...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-5">
      {!showResults ? (
        <div>
          <h2 className="text-xl font-bold mb-3">
            {questions[currentIndex].question}
          </h2>
          <div className="space-y-2">
            {["optionA", "optionB", "optionC", "optionD"].map((option) => (
              <div
                key={option}
                className={`w-full py-1 px-2 cursor-pointer text-black border text-left text-wrap ${
                  answers[questions[currentIndex].question_id] ===
                  questions[currentIndex][option]
                    ? "bg-blue-500 text-white"
                    : "bg-muted"
                }`}
                onClick={() =>
                  handleAnswer(
                    questions[currentIndex].question_id,
                    questions[currentIndex][option]
                  )
                }
              >
                {questions[currentIndex][option]}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-5">
            <Button onClick={finishTest} className="bg-red-500 text-white">
              Testni tugatish
            </Button>
            <Button onClick={nextQuestion} className="bg-green-500 text-white ">
              {currentIndex === questions.length - 1 ? "Tugatish" : "Keyingi"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold">Test natijasi</h2>
          <p className="text-sm mt-2">
            Siz <strong>{questions.length}</strong> ta savoldan{" "}
            <strong>{score}</strong> tasiga to‘g‘ri javob berdingiz.
          </p>
          <Button onClick={restartTest} className="mt-4 bg-blue-500 text-white">
            Qayta ishlash
          </Button>
          <br />
          <br />
          <Link
            href={`/`}
            className="mt-4 ml-2 py-2 px-4 rounded-sm bg-blue-500 text-white"
          >
            Asosiy sahifaga qaytish
          </Link>
          <div className="grid grid-cols-1 gap-3 mt-5">
            {questions.map((item, idx) => {
              const userAnswer = answers[item.question_id];
              const isCorrect = userAnswer === item.answer;
              return (
                <div
                  key={idx}
                  className={`p-3 border text-sm rounded-lg shadow-md flex justify-between text-left ${
                    isCorrect ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <div>
                    <h3 className="font-bold">{item.question}</h3>
                    <p className="mt-1">
                      <br />
                      <strong className="flex">
                        A: {item.optionA || "Tanlanmagan"}
                      </strong>
                      <strong className="flex">
                        B: {item.optionB || "Tanlanmagan"}
                      </strong>
                      <strong className="flex">
                        C: {item.optionC || "Tanlanmagan"}
                      </strong>
                      <strong className="flex">
                        D: {item.optionD || "Tanlanmagan"}
                      </strong>
                    </p>
                    <br />
                    <p className="mt-1">
                      Sizning javobingiz: <br />
                      <strong>{userAnswer || "Tanlanmagan"}</strong>
                    </p>
                    <br />
                    <p>
                      To‘g‘ri javob: <br /> <strong>{item.answer}</strong>
                    </p>
                  </div>
                  {isCorrect ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPlayingPage;
