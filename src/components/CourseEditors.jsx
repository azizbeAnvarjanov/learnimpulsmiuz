"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/app/supabaseClient";
import { UserRoundPlus } from "lucide-react";

const CourseEditors = ({ courseId }) => {
  const [employees, setEmployees] = useState([]);
  const [editors, setEditors] = useState([]);
  const [tempEditors, setTempEditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: employeesData, error: empError } = await supabase
        .from("employees")
        .select("id, fio");
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("editors, id")
        .eq("course_id", courseId)
        .single();

      if (empError) console.error("Xodimlarni olishda xatolik:", empError);
      else setEmployees(employeesData);

      if (courseError) {
        console.error("Kurs ma'lumotlarini olishda xatolik:", courseError);
      } else {
        let initialEditors = courseData?.editors || [];
        const creator = employeesData?.find(
          (emp) => emp.id === courseData?.creator_id
        );

        // Agar kurs yaratuvchisi editorlar ro‘yxatida bo‘lmasa, qo‘shamiz
        if (creator && !initialEditors.some((e) => e.id === creator.id)) {
          initialEditors = [
            ...initialEditors,
            { id: creator.id, name: creator.fio },
          ];
        }

        setEditors(initialEditors);
        setTempEditors(initialEditors);
      }

      setLoading(false);
    };

    fetchData();
  }, [courseId]);

  // Switch tugmasi o'zgarishi
  const toggleEditor = (employee) => {
    const isEditor = tempEditors.some((e) => e.id === employee.id);
    const updatedEditors = isEditor
      ? tempEditors.filter((e) => e.id !== employee.id) // O‘chirish
      : [...tempEditors, { id: employee.id, name: employee.fio }]; // Qo‘shish

    setTempEditors(updatedEditors);
  };

  // Saqlash funksiyasi
  const saveEditors = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({ editors: tempEditors })
      .eq("course_id", courseId);

    if (error) {
      console.error("Xatolik:", error);
    } else {
      setEditors(tempEditors);
      setIsDialogOpen(false); // Dialogni yopish
    }

    setSaving(false);
  };

  return (
    <div className="p-4 border-t bg-white flex items-center gap-3">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-[40px] h-[40px] rounded-xl">
            <UserRoundPlus />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xodimlardan editor qo‘shish</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p className="text-gray-500">Yuklanmoqda...</p>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <span>{employee.fio}</span>
                  <Switch
                    checked={tempEditors.some((e) => e.id === employee.id)}
                    onCheckedChange={() => toggleEditor(employee)}
                  />
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={saveEditors}
            disabled={saving}
            className="w-full mt-4"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-3">
        {editors.length > 0 ? (
          editors.map((editor) => (
            <p
              key={editor.id}
              className="text-sm py-2 px-4 bg-muted rounded-xl border border-[#faa21f] border-dashed"
            >
              {editor.name}
            </p>
          ))
        ) : (
          <p className="text-gray-500">Hozircha hech kim qo‘shilmagan</p>
        )}
      </div>
    </div>
  );
};

export default CourseEditors;
