"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/app/supabaseClient";
import { useParams } from "next/navigation";

export default function TestPage() {
  const params = useParams();
  const topicId = params.testId;
  const [tests, setTests] = useState([]);
  console.log(tests);
  const [newTest, setNewTest] = useState({
    question: "",
    options: ["", "", "", ""], // 4 variant
    correctIndex: 0,
    duration: 60,
  });

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("topic_id", topicId);

    if (error) {
      console.error("Testlarni olishda xatolik:", error.message);
    } else {
      setTests(data);
    }
  }

  async function addTest() {
    const { error } = await supabase.from("tests").insert([
      {
        topic_id: topicId,
        question: newTest.question,
        options: newTest.options,
        correct_index: newTest.correctIndex,
        duration: newTest.duration,
      },
    ]);

    if (error) {
      alert("Test qo‘shishda xatolik!");
    } else {
      fetchTests();
      setNewTest({
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        duration: 60,
      });
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Testlar</h2>

      {/* Test qo'shish formasi */}
      <div className="p-4 border rounded-lg mb-4">
        <h3 className="font-medium mb-2">Yangi test qo‘shish</h3>
        <Textarea
          placeholder="Savolni kiriting"
          value={newTest.question}
          onChange={(e) => setNewTest({ ...newTest, question: e.target.value })}
        />

        {/* Variantlar */}
        {newTest.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <input
              type="radio"
              checked={newTest.correctIndex === index}
              onChange={() => setNewTest({ ...newTest, correctIndex: index })}
            />
            <Input
              placeholder={`Variant ${index + 1}`}
              value={option}
              onChange={(e) => {
                let updatedOptions = [...newTest.options];
                updatedOptions[index] = e.target.value;
                setNewTest({ ...newTest, options: updatedOptions });
              }}
            />
          </div>
        ))}

        {/* Vaqt va qo'shish tugmasi */}
        <Input
          type="number"
          placeholder="Test vaqti (sekund)"
          value={newTest.duration}
          onChange={(e) =>
            setNewTest({ ...newTest, duration: Number(e.target.value) })
          }
        />

        <Button onClick={addTest} className="mt-3">
          Test qo‘shish
        </Button>
      </div>

      {/* Testlarni chiqarish */}
      {tests.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {tests.map((test, index) => (
            <li key={index} className="p-4 border rounded-lg">
              <h3 className="font-medium">{test.question}</h3>
              <ul className="mt-2 space-y-1">
                {test.options.map((option, i) => (
                  <li
                    key={i}
                    className={`p-2 rounded-md ${
                      i === test.correct_index ? "bg-green-200" : "bg-gray-100"
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-gray-500">
                ⏳ {test.duration} sekund
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Testlar mavjud emas.</p>
      )}
    </div>
  );
}
