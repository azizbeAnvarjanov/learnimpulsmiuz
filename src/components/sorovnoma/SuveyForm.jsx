"use client";

import { useState } from "react";
import { supabase } from "@/app/supabaseClient";
import questions from "@/components/sorovnoma/questions.json";
import Cookies from "js-cookie";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";

export default function SurveyForm() {
  const user = Cookies.get("user");
  const [showPopup, setShowPopup] = useState(true);
  let parsedUser;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    parsedUser = null;
  }

  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Majburiy tekshiruv: barcha savollarga javob berilganligini tekshirish
    const unanswered = questions.filter((q) => {
      const answer = responses[q.id];
      if (q.question_type === "checkbox") {
        return !answer || answer.length === 0;
      }
      return !answer;
    });

    if (unanswered.length > 0) {
      alert("Илтимос, барча саволларга жавоб беринг.");
      setLoading(false);
      return;
    }

    const userInfo = parsedUser || {
      fio: "Anonymous",
      talaba_id: "Unknown",
      kurs: "Unknown",
      guruh: "Unknown",
      role: "Unknown",
      foregin_id: "Unknown",
      seria: "Unknown",
      created_at: "Unknown",
    };

    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .insert([{ user_info: userInfo, completed: true }])
      .select()
      .single();

    if (surveyError) {
      console.error("Error creating survey:", surveyError);
      setLoading(false);
      return;
    }

    const responseEntries = Object.entries(responses).map(
      ([questionId, response]) => ({
        survey_id: survey.id,
        question_id: questionId,
        response: JSON.stringify(response),
      })
    );

    const { error: responseError } = await supabase
      .from("survey_responses")
      .insert(responseEntries);

    if (responseError) {
      console.error("Error saving responses:", responseError);
    } else {
      Cookies.set("sorovnoma", "true", { expires: 7 });
      alert("Сўровнома муваффақиятли юбортилди!");
      setResponses({});
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <div>
      {showPopup && (
        <div className="fixed bg-white left-0 top-0 z-50 w-full h-screen grid place-items-center">
          <div className="w-full max-w-[90%] sm:max-w-[70%] lg:max-w-[40%] bg-white rounded-xl">
            <Image
              src={"/logo.png"}
              alt="Logo"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <h1 className="text-base sm:text-lg text-center font-medium italic">
              Ҳурматли талаба! Ушбу сўровнома орқали институтимизда таълим
              сифатини яхшилаш ва сизнинг эҳтиёжларингизни чуқурроқ тушунишни
              мақсад қилганмиз. Илтимос, саволларга холис ва рост жавоб беринг.
              Сиздан шахсий маълумотлар талаб қилинмайди.
            </h1>
            <Button
              className="mx-auto mt-5 flex"
              onClick={() => setShowPopup(false)}
            >
              Сўровномани бошлаш
            </Button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Сўровнома</h1>
        {questions.map((question) => (
          <div key={question.id} className="mb-6">
            <p className="font-semibold">{question.question_text}</p>
            {question.question_type === "radio" && question.options && (
              <div>
                {question.options.map((option, index) => (
                  <label key={index} className="block">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={responses[question.id] === option}
                      onChange={() => handleResponseChange(question.id, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            {question.question_type === "checkbox" && question.options && (
              <div>
                {question.options.map((option, index) => (
                  <label key={index} className="block">
                    <input
                      type="checkbox"
                      value={option}
                      checked={(responses[question.id] || []).includes(option)}
                      onChange={(e) => {
                        const current = responses[question.id] || [];
                        const updated = e.target.checked
                          ? [...current, option]
                          : current.filter((item) => item !== option);
                        handleResponseChange(question.id, updated);
                      }}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
            {question.question_type === "text" && (
              <Textarea
                value={responses[question.id] || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                className="w-full p-2 border rounded"
                rows={4}
              />
            )}
          </div>
        ))}
        <Button type="submit" disabled={loading} className="flex w-full">
          {loading ? "Юкланмоқда..." : "Юбориш"}
        </Button>
      </form>
    </div>
  );
}
