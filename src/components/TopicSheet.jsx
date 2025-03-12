"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlignJustify,
  BookOpenCheck,
  Paperclip,
  RefreshCcw,
  Video,
} from "lucide-react";
import { supabase } from "@/app/supabaseClient";
import { DialogTitle } from "./ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
export default function TopicsSheet({
  course_id,
  selectedTopic,
  handleTopicClick,
  test,
}) {
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
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <AlignJustify />
          </Button>
        </SheetTrigger>
        <DialogTitle className="hidden"></DialogTitle>
        <SheetContent side="right" className="overflow-y-scroll">
          <div className="flex items-center justify-between p-2">
            <strong className="text-lg">Mavzular</strong>
            <Button variant="outline" onClick={fetchTopics}>
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
                    onClick={() => {
                      handleTopicClick(topic), setOpen(false);
                    }}
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
                      className="flex items-center gap-2 border p-3 rounded-lg bg-white"
                      href={`${file.url}`}
                      key={idx}
                      onClick={() => setOpen(false)}
                    >
                      <Paperclip />
                      <h1 className="font-bold">{file.name}</h1>
                    </Link>
                  ))}
                  {test !== null && (
                    <Link
                      href={`/test/${test.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 border p-3 rounded-lg bg-white"
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
