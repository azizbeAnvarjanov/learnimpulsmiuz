"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog2";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/app/supabaseClient";
import { UserRoundPlus } from "lucide-react";

const ApplicationExcecutors = ({ applicationId }) => {
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
        .select("id, fio")
        .eq("role", "Employee");
      const { data: courseData, error: courseError } = await supabase
        .from("applications")
        .select("bajaruvchilar")
        .eq("id", applicationId)
        .single();

      if (empError) console.error("Xodimlarni olishda xatolik:", empError);
      else setEmployees(employeesData);

      if (courseError) {
        console.error(
          "Appication ma'lumotlarini olishda xatolik:",
          courseError
        );
      } else {
        let initialEditors = courseData?.bajaruvchilar || [];
        const creator = employeesData?.find((emp) => emp.id === courseData?.id);

        // Agar kurs yaratuvchisi editorlar ro‘yxatida bo‘lmasa, qo‘shamiz
        if (creator && !initialEditors.some((e) => e.id === creator.id)) {
          initialEditors = [
            ...initialEditors,
            { id: creator.id, user: creator.fio },
          ];
        }

        setEditors(initialEditors);
        setTempEditors(initialEditors);
      }

      setLoading(false);
    };

    fetchData();
  }, [applicationId]);

  // Switch tugmasi o'zgarishi
  const toggleEditor = (employee) => {
    const isEditor = tempEditors.some((e) => e.id === employee.id);
    const updatedEditors = isEditor
      ? tempEditors.filter((e) => e.id !== employee.id) // O‘chirish
      : [...tempEditors, { id: employee.id, user: employee.fio }]; // Qo‘shish

    setTempEditors(updatedEditors);
  };

  // Saqlash funksiyasi
  const saveEditors = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("applications")
      .update({ bajaruvchilar: tempEditors })
      .eq("id", applicationId);

    if (error) {
      console.error("Xatolik:", error);
    } else {
      setEditors(tempEditors);
      setIsDialogOpen(false); // Dialogni yopish
    }

    setSaving(false);
  };

  return (
    <div className="p-2 bg-white">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="h-[30px] mb-3 rounded-full">
            Mas'ul biriktirish
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
            <div className="grid grid-cols-3 gap-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center border border-gray-200 justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <span>
                    {employee.fio}
                  </span>
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
            className="w-[300px] mt-4 ml-auto"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-2 flex-wrap">
        {editors.length > 0 ? (
          editors.map((editor) => (
            <p
              key={editor.id}
              className="text-sm py-1 px-3 bg-muted rounded-full border border-[#faa21f] border-dashed"
            >
              {editor.user}
            </p>
          ))
        ) : (
          <p className="text-gray-500">Hozircha hech kim qo‘shilmagan</p>
        )}
      </div>
    </div>
  );
};

export default ApplicationExcecutors;
