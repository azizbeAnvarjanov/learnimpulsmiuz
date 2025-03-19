"use client";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import clsx from "clsx";

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

  console.log(user);

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
      setApplicationText("");
      fetchApplications(user?.id);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Ariza Yuborish</h2>
      <Textarea
        placeholder="Ariza matnini kiriting..."
        value={applicationText}
        onChange={(e) => setApplicationText(e.target.value)}
        className="w-full mb-4"
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Yuborilmoqda..." : "Yuborish"}
      </Button>
      <h2 className="text-xl  font-bold mt-6 mb-4">Yuborilgan Arizalar</h2>
      <div className="mt-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">⏳ Yuklanmoqda...</p>
        ) : applications.length === 0 ? (
          <p className="text-center text-gray-500">❌ Arizalar topilmadi</p>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="border p-4 rounded-lg shadow-md">
              <p className="text-sm text-gray-600">
                {new Date(app.created_at).toLocaleString()}
              </p>
              <div className="line-clamp-2 text-gray-800 mt-2">
                {app.student_application}
              </div>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant="link"
                    className="text-blue-500 p-0 mt-2"
                    onClick={() => setSelectedApplication(app)}
                  >
                    Batafsil
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="pb-40">
                    <DrawerTitle className="max-w-[500px] mx-auto text-2xl">
                      Ariza Tafsilotlari
                    </DrawerTitle>
                    {selectedApplication && ( // ❗ Oldini olish uchun shart qo‘shildi
                      <div className="max-w-[500px] mx-auto">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {new Date(
                              selectedApplication.created_at
                            ).toLocaleString()}
                          </div>
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
                        <div className="mt-2 text-gray-800 !text-left flex items-start justify-start">
                          {selectedApplication.student_application}
                        </div>
                      </div>
                    )}
                  </DrawerHeader>
                </DrawerContent>
              </Drawer>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationPage;
