"use client";

import { useState, useEffect } from "react";
import questions from "@/components/sorovnoma/questions.json";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Cookies from "js-cookie";

export default function Results() {
  const user = Cookies.get("user");
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        // Cookie'dan user ma'lumotlarini olish va parse qilish
        let parsedUser = null;
        if (user) {
          try {
            parsedUser = JSON.parse(user);
            console.log("Parsed user from cookie:", parsedUser);
          } catch (parseError) {
            console.error("Error parsing user cookie:", parseError);
            setError("Cookie ma'lumotlarini o'qishda xato.");
            setLoading(false);
            return;
          }
        }

        // API'dan ma'lumotlarni olish
        const response = await fetch("/api/results");
        const data = await response.json();
        console.log("API response:", data);

        if (!response.ok) {
          throw new Error(data.error || "API javobida xato.");
        }

        // user_info'ni parse qilish (agar string sifatida kelsa)
        const parsedData = data.map((survey) => ({
          ...survey,
          user_info:
            typeof survey.user_info === "string"
              ? JSON.parse(survey.user_info)
              : survey.user_info,
        }));

        // Barcha natijalarni setSurveys ga o'rnatish
        setSurveys(parsedData);

        if (parsedData.length === 0) {
          setError("Umuman natijalar topilmadi.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi.");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  // Excel fayl yaratish va yuklab olish
  const downloadExcel = () => {
    const worksheetData = surveys.flatMap((survey) =>
      survey.survey_responses.map((response) => {
        const question = questions.find((q) => q.id === response.question_id);
        let formattedResponse;
        try {
          formattedResponse = JSON.parse(response.response);
          if (Array.isArray(formattedResponse)) {
            formattedResponse = formattedResponse.join(", ");
          }
        } catch {
          formattedResponse = response.response;
        }
        return {
          Foydalanuvchi: survey.user_info.fio,
          Guruh: survey.user_info.guruh,
          Kurs: survey.user_info.kurs,
          "Yuborilgan vaqt": new Date(survey.created_at).toLocaleString(
            "uz-UZ"
          ),
          Savol: question?.question_text || "Savol topilmadi",
          Javob: formattedResponse,
        };
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Results");

    // Excel faylni yaratish va yuklab olish
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `survey_results_${new Date().toISOString()}.xlsx`);
  };

  if (loading) return <div className="text-center">Yuklanmoqda...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">S'rovnoma natijalari</h1>
      <p className="text-gray-600 mb-4">
        {surveys.length} ta foydalanuvchi natijalari bor.
      </p>
      <button
        onClick={downloadExcel}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Excel'ga yuklab olish
      </button>
      {surveys.map((survey) => (
        <Accordion type="single" collapsible key={survey.id}>
          <AccordionItem value={survey.id}>
            <AccordionTrigger>
              <div>
                {survey.user_info.fio} ({survey.user_info.guruh})
                <p>{survey.user_info.kurs}</p>
                <p className="text-gray-600">
                  {new Date(survey.created_at).toLocaleString("uz-UZ")}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {survey.survey_responses.map((response, index) => {
                const question = questions.find(
                  (q) => q.id === response.question_id
                );
                if (!question) return null;
                let formattedResponse;
                try {
                  formattedResponse = JSON.parse(response.response);
                  if (Array.isArray(formattedResponse)) {
                    formattedResponse = formattedResponse.join("\n");
                  }
                } catch {
                  formattedResponse = response.response;
                }
                return (
                  <div key={response.question_id} className="mb-4">
                    <p className="font-medium">
                      {index + 1}. {question.question_text}
                    </p>
                    <p className="text-gray-700 whitespace-pre-line">
                      Javob: {formattedResponse}
                    </p>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}
