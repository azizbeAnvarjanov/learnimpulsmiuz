"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlignJustify, RefreshCcw } from "lucide-react";
import { supabase } from "@/app/supabaseClient";
import { DialogTitle } from "./ui/dialog";

export default function TopicsSheet({ course_id, selectedTopic, handleTopicClick }) {
  const [topics, setTopics] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [course_id]);

  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("course_id", course_id)
      .order("order", { ascending: true });
    if (!error) setTopics(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline"><AlignJustify /></Button>
      </SheetTrigger>
      <DialogTitle className="hidden"></DialogTitle>
      <SheetContent side="right">
        <div className="flex items-center justify-between p-2">
          <strong className="text-lg">Mavzular</strong>
          <Button variant="outline" onClick={fetchTopics}>
            <RefreshCcw />
          </Button>
        </div>
        <ul className="mt-4">
          {topics.map((topic) => (
            <li
              key={topic.topic_id}
              className={`cursor-pointer border-t py-3 px-4 ${
                selectedTopic?.topic_id === topic.topic_id ? "bg-green-300" : "hover:bg-gray-100"
              }`}
              onClick={() => {
                handleTopicClick(topic);
                setOpen(false); // Sheetni yopish
              }}
            >
              {topic.name}
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
