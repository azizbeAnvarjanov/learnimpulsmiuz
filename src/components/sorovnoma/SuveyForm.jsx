"use client";

import { useState } from "react";
import { supabase } from "@/app/supabaseClient";
import questions from "@/components/sorovnoma/questions.json";
import Cookies from "js-cookie";

export default function SurveyForm() {
  const user = Cookies.get("user"); // Cookie'dan foydalanuvchi ma'lumotini olish
  let parsedUser;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    parsedUser = null;
  }

  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  // Жавобларни ўзгартириш
  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  // Формани юбориш
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Фойдаланувчи маълумотларини cookie'дан олиш
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

    // Янги сўров яратиш
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

    // Жавобларни сақлаш
    const responseEntries = Object.entries(responses).map(
      ([questionId, response]) => ({
        survey_id: survey.id,
        question_id: questionId,
        response: JSON.stringify(response), // JSONB формати учун response'ни JSON'га айлантириш
      })
    );

    const { error: responseError } = await supabase
      .from("survey_responses")
      .insert(responseEntries);

    if (responseError) {
      console.error("Error saving responses:", responseError);
    } else {
      Cookies.set("sorovnoma", "true", { expires: 7 }); // 7 kunlik cookie
      window.location.reload();
      window.location.href = "/";
      alert("Сўровнома муваффақиятли юбортилди!");
      setResponses({});
    }
    setLoading(false);
  };

  return (
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
            <textarea
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
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Юборish
      </button>
    </form>
  );
}
