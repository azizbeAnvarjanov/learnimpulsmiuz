"use client";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { supabase } from "../supabaseClient";
import Cookies from "js-cookie";

import clsx from "clsx";
import StudentNavbar from "@/components/StudentNavbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays, Eye } from "lucide-react";
import Image from "next/image";

const statusColors = {
  Yuborildi: "bg-blue-500",
  "Ko'rib chiqilmoqda": "bg-yellow-500",
  "Bekor qilindi": "bg-red-500",
  "Muvaffaqiyatli tugatildi": "bg-green-500",
};

const ApplicationPage = () => {
  const [applicationText, setApplicationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchApplications(parsedUser.id);
    }
  }, []);

  const fetchApplications = async (id) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("student_id", id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Arizalarni olishda xatolik yuz berdi");
    } else {
      setApplications(data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!applicationText.trim()) {
      toast.error("Ariza matnini kiriting");
      return;
    }

    setLoading(true);
    const newApplication = {
      student_id: user?.id,
      student_application: applicationText,
      status: "Yuborildi",
      status_history: [
        {
          time: new Date().toISOString(),
          comment: "Ariza kelib tushdi",
          user: user.fio,
        },
      ],
      bajaruvchilar: [
        {
          id: 10,
          user: "Registrator Ofis",
        },
      ],
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("applications")
      .insert([newApplication]);
    if (error) {
      toast.error("Arizani yuborishda xatolik yuz berdi");
      console.error(error);
    } else {
      toast.success("Ariza muvaffaqiyatli yuborildi");
      sendToTelegram(user?.fio, applicationText);
      setApplicationText("");
      fetchApplications(user?.id);
    }
    setLoading(false);
  };

  const sendToTelegram = async (studentName, applicationText) => {
    const token = "7849058559:AAE9exbdwx13H0XJ_0ePqUxGlJ7o4DSIDf8"; // O'zingizning bot tokeningizni qo'ying
    const chat_id = "-4691710080"; // O'zingizning guruh chat ID'ingizni qo'ying
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const message = `
📢 *Yangi ariza kelib tushdi!* 📝

👤 *Talaba:* ${studentName}
📄 *Ariza matni:* ${applicationText}
📅 *Vaqt:* ${new Date().toLocaleString()}

🔗 *Batafsil ko‘rish uchun tizimga kiring. learn.impulsmi.uz*
`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat_id,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        throw new Error("Telegram API xatosi");
      }

      console.log("Telegramga xabar yuborildi!");
    } catch (error) {
      console.error("Telegram xabari yuborilmadi:", error);
    }
  };

  return (
    <div>
      <StudentNavbar />

      <div className="md:max-w-[70%] gap-5 mx-auto p-4 grid md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold mb-4">Ariza Yuborish</h2>
          <Textarea
            placeholder="Ariza matnini kiriting..."
            value={applicationText}
            onChange={(e) => setApplicationText(e.target.value)}
            className="w-full mb-4 h-[20vh]"
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Yuborilgan Arizalar</h2>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-center text-gray-500">⏳ Yuklanmoqda...</p>
            ) : applications.length === 0 ? (
              <p className="text-center text-gray-500">❌ Arizalar topilmadi</p>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="border p-3 rounded-lg shadow-md flex items-center justify-between gap-2"
                >
                  <div className="flex items-start">
                    <div className="min-w-[50px] min-h-[50px] relative">
                      <Image
                        src={"/doc.png"}
                        fill
                        alt=""
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="line-clamp-1 text-gray-800">
                        {app.student_application}
                      </div>
                      <p className="text-sm text-gray-600 flex gap-1 items-center mt-1">
                        <CalendarDays size={17} />
                        {new Date(app.created_at).toLocaleString()}
                      </p>{" "}
                    </div>
                  </div>
                  <br />
                  {/* Dialog Trigger */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-[40px] h-[40px] bg-[#2196f3] rounded-xl"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye />
                      </Button>
                    </DialogTrigger>

                    {/* Dialog Content */}
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="max-w-[500px] mx-auto text-2xl">
                          Ariza Tafsilotlari
                        </DialogTitle>
                      </DialogHeader>

                      {selectedApplication && (
                        <div className="space-y-4">
                          <div className="md:flex items-center justify-between">
                            <p className="text-sm text-gray-600 flex gap-1 items-center mt-1">
                              <CalendarDays size={17} />
                              {new Date(app.created_at).toLocaleString()}
                            </p>{" "}
                            <div
                              className={clsx(
                                "inline-block mt-2 text-white px-3 py-1 rounded-full text-sm",
                                statusColors[selectedApplication.status] ||
                                  "bg-gray-500"
                              )}
                            >
                              {selectedApplication.status}
                            </div>
                          </div>
                          <div className="mt-2 text-gray-800 text-left">
                            {selectedApplication.student_application}
                          </div>
                          <p className="mt-2"></p>
                          <div className="text-gray-800 text-left">
                            <strong>Ariza natijasi: </strong>
                            {selectedApplication.result_application}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
