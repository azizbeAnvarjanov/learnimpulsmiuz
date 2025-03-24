import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/app/supabaseClient";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FilePenLine } from "lucide-react";

const EditQuestionDialog = ({ testId, questionId, tests, setTests }) => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [options, setOptions] = useState({
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
  });
  const [answer, setAnswer] = useState("A");
  const [isOpen, setIsOpen] = useState(false);

  const editQuestion = () => {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;
    const question = test.questions.find((q) => q.question_id === questionId);
    if (!question) return;

    setSelectedTest(test);
    setSelectedQuestion(question);
    setEditedQuestion(question.question);
    setOptions({
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
    });
    setAnswer(question.answer);
    setIsOpen(true);
  };

  const updateQuestion = async () => {
    if (!selectedTest || !selectedQuestion) return;
    const updatedQuestions = selectedTest.questions.map((q) =>
      q.question_id === selectedQuestion.question_id
        ? { ...q, question: editedQuestion, ...options, answer }
        : q
    );

    const { error } = await supabase
      .from("tests")
      .update({ questions: updatedQuestions })
      .eq("id", selectedTest.id);

    if (error) {
      console.error("Savolni yangilashda xatolik:", error);
    } else {
      setTests(
        tests.map((t) =>
          t.id === selectedTest.id ? { ...t, questions: updatedQuestions } : t
        )
      );
      setSelectedTest(null);
      setSelectedQuestion(null);
      setIsOpen(false);
      toast.success("Savol yangilandi!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} className="">
      <DialogTrigger asChild>
        <Button onClick={editQuestion}><FilePenLine /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Savolni Tahrirlash</DialogTitle>
        {selectedQuestion && (
          <div className="space-y-4 min-w-[900px] mx-auto">
            <Input
              label="Savol"
              className="text-wrap w-full"
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
            />
            {Object.keys(options).map((key) => (
              <Input
                key={key}
                label={key.toUpperCase()}
                value={options[key]}
                className="text-wrap w-full"
                onChange={(e) =>
                  setOptions({ ...options, [key]: e.target.value })
                }
              />
            ))}

            <label className="block font-medium">To‘g‘ri javob</label>
            <Select defaultValue={answer} onValueChange={setAnswer}>
              <SelectTrigger>
                <SelectValue placeholder={answer} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(options).map((key) => (
                  <SelectItem key={key} value={options[key]}>
                    {options[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={updateQuestion}>Yangilash</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionDialog;
