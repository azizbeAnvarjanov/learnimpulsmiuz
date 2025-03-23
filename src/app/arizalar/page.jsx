"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/app/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog2";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DoorClosed,
  RefreshCcw,
  SendHorizontal,
  Trello,
  User,
} from "lucide-react";
import DashbNavbar from "@/app/dashboard/DashboardNavbar";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [result, setResult] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [user, setuser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      setuser(JSON.parse(userData)); // Cookie'dan ma'lumotni olish va holatga saqlash
    }
  }, []);

  async function fetchApplications() {
    let { data, error } = await supabase
      .from("applications")
      .select(
        `
      id,
      status,
      created_at,
      result_application,
      student_application,
      comments,
      students(*),
      taqsimlovchi:employees!applications_taqsimlovchi_fkey(*),
      bajaruvchi:employees!applications_bajaruvchi_fkey(*)
    `
      )
      .order("created_at", { ascending: false })
      .eq("bajaruvchi", user?.id);

    if (error) console.error(error);
    else setApplications(data);
  }
  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    async function fetchEmployees() {
      let { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("role", "Employee");
      if (error) console.error(error);
      else setEmployees(data);
    }
    fetchEmployees();
  }, []);

  const handleView = (application) => {
    fetchApplications();
    setSelectedApplication(application);
  };

  const handleAssign = async (applicationId) => {
    if (!selectedEmployee) return toast.error("Bajaruvchi tanlang!");
    const { error } = await supabase
      .from("applications")
      .update({ bajaruvchi: selectedEmployee, status: "Ko‘rib chiqilmoqda" })
      .eq("id", applicationId);
    if (error) return console.error(error);

    toast.success("Bajaruvchi biriktirildi!");
    fetchApplications();
  };

  const handleCloseApplication = async (applicationId) => {
    if (!result) return toast.error("Arizaning natijasini kiriting!");

    const { error } = await supabase
      .from("applications")
      .update({ status: "Ariza tugatildi", result_application: result })
      .eq("id", applicationId);
    if (error) return console.error(error);

    toast.success("Ariza yopildi!");
    fetchApplications();
  };
  const handleCancledApplication = async (applicationId) => {
    if (!result)
      return toast.error("Bekor qilish uchun arizaning natijasini kiriting!");

    const { error } = await supabase
      .from("applications")
      .update({ status: "Bekor qilindi", result_application: result })
      .eq("id", applicationId);
    if (error) return console.error(error);

    toast.success("Ariza Bekor qilindi!");
    fetchApplications();
  };

  const handleAddComment = async () => {
    if (!newComment.trim())
      return toast.error("Kommentariya matni bo‘sh bo‘lmasligi kerak!");

    const newCommentObject = {
      text: newComment,
      timestamp: new Date().toLocaleString(),
      user: "Admin",
      type: user?.fio,
    };

    const updatedComments = [
      ...(selectedApplication.comments || []),
      newCommentObject,
    ];
    const { error } = await supabase
      .from("applications")
      .update({ comments: updatedComments })
      .eq("id", selectedApplication.id);

    if (error) return console.error(error);

    toast.success("Kommentariya qo‘shildi!");
    setSelectedApplication((prev) => ({ ...prev, comments: updatedComments }));
    setNewComment("");
    fetchApplications();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Yuborildi":
        return "bg-blue-400 text-white p-1 flex rounded-full min-h-[5px] max-w-[5px]";
      case "Ko‘rib chiqilmoqda":
        return "bg-yellow-400 text-white p-1 flex rounded-full min-h-[5px] max-w-[5px]";
      case "Ariza tugatildi":
        return "bg-green-400 text-white p-1 flex rounded-full min-h-[5px] max-w-[5px]";
      case "Bekor qilindi":
        return "bg-red-400 text-white p-1 flex rounded-full min-h-[5px] max-w-[5px]";
      default:
        return "";
    }
  };

  const getStatusColor2 = (status) => {
    switch (status) {
      case "Yuborildi":
        return "bg-blue-400 text-white w-fit text-[13px] px-2  rounded-full mt-2";
      case "Ko‘rib chiqilmoqda":
        return "bg-yellow-400 text-white w-fit text-[13px] px-2  rounded-full mt-2";
      case "Ariza tugatildi":
        return "bg-green-400 text-white w-fit text-[13px] px-2  rounded-full mt-2";
      case "Bekor qilindi":
        return "bg-red-400 text-white w-fit text-[13px] px-2  rounded-full mt-2";
      default:
        return "";
    }
  };
  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const paginatedApplications = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log(selectedApplication);

  function formatUzbekistanTime(createdAt) {
    const date = new Date(createdAt);

    // Hafta kunlari o‘zbekcha
    const days = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

    // O‘zbekiston vaqtiga o'tkazish
    const options = {
      timeZone: "Asia/Tashkent",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24 soat formatida
    };

    // O‘zbekiston vaqti bo‘yicha vaqtni formatlash
    const formatter = new Intl.DateTimeFormat("uz-UZ", options);
    let formattedDate = formatter.format(date);

    // "23.03.2024, 15:40" → "2024-03-23 15:40" formatiga o‘zgartirish
    formattedDate = formattedDate
      .replace(/(\d+)\.(\d+)\.(\d+),/, "$3-$2-$1")
      .replace(",", "");

    // Hafta kunini qo‘shish
    const dayOfWeek = days[date.getUTCDay()]; // UTC kunni olamiz va +5 soat qo‘shamiz
    return `${dayOfWeek}, ${formattedDate}`;
  }

  function formatUzbekistanTime2(createdAt) {
    const date = new Date(createdAt);

    // Hafta kunlari o‘zbekcha
    const days = [
      "Yakshanba",
      "Dushanba",
      "Seshanba",
      "Chorshanba",
      "Payshanba",
      "Juma",
      "Shanba",
    ];

    // O‘zbekiston vaqtiga o'tkazish
    const options = {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24 soat formatida
    };

    // O‘zbekiston vaqti bo‘yicha vaqtni formatlash
    const formatter = new Intl.DateTimeFormat("uz-UZ", options);
    let formattedDate = formatter.format(date);

    // "23.03.2024, 15:40" → "2024-03-23 15:40" formatiga o‘zgartirish
    formattedDate = formattedDate
      .replace(/(\d+)\.(\d+)\.(\d+),/, "$3-$2-$1")
      .replace(",", "");

    // Hafta kunini qo‘shish
    const dayOfWeek = days[date.getUTCDay()]; // UTC kunni olamiz va +5 soat qo‘shamiz
    return `${dayOfWeek}, ${formattedDate}`;
  }

  function formatUzbekistanTime3(timestamp) {
    // Hafta kunlari o‘zbekcha
    const days = [
      "Yakshanba",
      "Dushanba",
      "Seshanba",
      "Chorshanba",
      "Payshanba",
      "Juma",
      "Shanba",
    ];
    // Oylari o‘zbekcha
    const months = [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "Avgust",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
    ];

    // Sana va vaqtni ajratib olish
    const [datePart, timePart] = timestamp.split(", ");
    const [day, month, year] = datePart.split(".").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // Sana obyektini yaratish (mahalliy vaqt sifatida)
    const date = new Date(year, month - 1, day, hour, minute, second);

    // O‘zbekiston vaqtiga o'tkazish
    const options = {
      timeZone: "Asia/Tashkent",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24 soat formati
    };

    // Vaqtni formatlash
    const formatter = new Intl.DateTimeFormat("uz-UZ", options);
    const formattedTime = formatter.format(date);

    // Hafta kuni va oy nomini chiqarish
    const dayOfWeek = days[date.getDay()];
    const monthName = months[date.getMonth()];

    return `${dayOfWeek}, ${day}-${monthName} ${formattedTime}`;
  }
  useEffect(() => {
    const results = paginatedApplications.filter((user) =>
      user.students?.fio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, applications]);
  return (
    <div>
      {/* <DashbNavbar /> */}
      <div className="">
        {/* --------------------------- */}
        <div>
          <div className="w-full border-b min-h-[92vh] grid grid-cols-3">
            <div className="w-full h-full overflow-y-auto max-h-[92vh] relative">
              <div className="flex items-center justify-between gap-2 p-2 border-b sticky top-0 left-0 bg-white w-full">
                <h1 className="font-bold text-2xl">Arzialar</h1>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-[300px]"
                    placeholder="Qidirish..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                  />
                  <Button
                    onClick={fetchApplications}
                    className="w-[35px] h-[35px] grid place-items-center"
                    variant="outline"
                  >
                    <RefreshCcw />
                  </Button>
                </div>
              </div>
              {filteredUsers.map((app, idx) => (
                <div
                  onClick={() => handleView(app)}
                  className={`"border-b p-1 flex items-center hover:bg-muted cursor-pointer " ${
                    selectedApplication?.id === app?.id &&
                    "bg-gray-200 hover:bg-gray-200 cursor-pointer"
                  }`}
                  key={idx}
                >
                  <div className="p-2">
                    <div className="flex items-center gap-1">
                      <span className={getStatusColor(app.status)}> </span>
                      <h1 className="text-[13px] line-clamp-1 capitalize font-medium">
                        {app.students?.fio || "Noma’lum"}
                      </h1>
                      <h1 className="text-[12px] w-fit ml-auto text-gray-500 line-clamp-1">
                        {formatUzbekistanTime(app.created_at) || "Noma’lum"}
                      </h1>
                    </div>
                    <h1 className="text-[13px] text-gray-500 line-clamp-1">
                      {app.student_application || "Noma’lum"}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
            {/* --------------------------- */}

            <div className="border-x w-full max-h-[92vh] p-4 text-sm overflow-y-auto">
              {selectedApplication ? (
                <>
                  <div>
                    <div className="flex items-start gap-3 border-b mb-2 pb-2">
                      <div className="min-w-[70px] min-h-[70px] border rounded-full grid place-items-center mb-2 bg-gray-100">
                        <User color="gray" />
                      </div>
                      <div>
                        <p>{selectedApplication.students?.fio}</p>
                        <div className="flex gap-4 items-center py-1">
                          <p className="text-[12px] text-gray-500 flex items-center gap-1">
                            <DoorClosed color="#60a5fa" size={19} />
                            {selectedApplication.students?.kurs}
                          </p>
                          <p className="text-[12px] text-gray-500 flex items-center gap-1">
                            <Trello color="#60a5fa" size={17} />
                            {selectedApplication.students?.guruh}
                          </p>
                          <h1 className="text-[12px] text-gray-500 flex items-center gap-1">
                            <CalendarDays color="#60a5fa" size={17} />
                            {formatUzbekistanTime2(
                              selectedApplication.created_at
                            ) || "Noma’lum"}
                          </h1>
                        </div>

                        <span
                          className={getStatusColor2(
                            selectedApplication.status
                          )}
                        >
                          {selectedApplication.status}
                        </span>
                      </div>
                    </div>

                    <p className="flex items-center gap-2">
                      <strong>Ma'sul:</strong>
                      {selectedApplication.bajaruvchi
                        ? selectedApplication.bajaruvchi.fio
                        : "Tayinlanmagan"}
                    </p>
                    <br />
                    <p>
                      <strong>Ariza:</strong> <br />
                      {selectedApplication.student_application}
                    </p>
                    <br />
                    <p>
                      <strong>Natija:</strong>{" "}
                      {selectedApplication.result_application}
                    </p>
                    <br />

                    <div className="flex items-center gap-3">
                      <Select onValueChange={setSelectedEmployee}>
                        <SelectTrigger className="">
                          <SelectValue placeholder={"Bajaruvchini tanlang"} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.fio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleAssign(selectedApplication.id)}
                      >
                        Bajaruvchini biriktirish
                      </Button>
                    </div>

                    <Input
                      type="text"
                      placeholder="Natijani kiriting"
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      className="border p-2 mt-4 w-full"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        onClick={() =>
                          handleCloseApplication(selectedApplication.id)
                        }
                      >
                        Arizani yopish
                      </Button>
                      <Button
                        onClick={() =>
                          handleCancledApplication(selectedApplication.id)
                        }
                        variant="destructive"
                      >
                        Arizani bekor qilish
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  Ko'rmoqchi bo'lgan arizangizni tanlang!
                </div>
              )}
            </div>
            {/* --------------------------- */}

            <div className=" w-full max-h-[92vh] overflow-y-auto relative">
              <div className="flex items-center justify-between gap-2 sticky top-0 left-0 bg-white py-4 px-4">
                <Input
                  type="text"
                  placeholder="Kommentariya yozish..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  onClick={handleAddComment}
                  className="w-[35px] h-[35px]"
                >
                  <SendHorizontal />
                </Button>
              </div>
              <div className="px-3">
                {selectedApplication?.comments?.length ? (
                  [...selectedApplication.comments] // Massivni nusxalash (mutatsiyaga yo'l qo'ymaslik uchun)
                    .reverse() // Kommentlarni teskari tartibda chiqarish
                    .map((comment, index) => (
                      <div
                        key={index}
                        className={` mb-2 border w-[90%] ${
                          comment.type !== "admin"
                            ? "ml-auto bg-blue-100 border-blue-400 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none"
                            : "mr-auto bg-gray-100 border-gray-400 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                        }`}
                      >
                        <div
                          className={`${
                            comment.type === "admin"
                              ? "p-2 flex items-center justify-between border-b pb-1 border-gray-400"
                              : "p-2 flex items-center justify-between border-b pb-1 border-blue-400"
                          }`}
                        >
                          <p className="text-[12px] font-semibold capitalize">
                            {comment.type}
                          </p>
                          <p className="text-[12px]">
                            {formatUzbekistanTime3(comment.timestamp)}
                          </p>
                        </div>
                        <p className="p-2">
                          <span className="text-sm">{comment.text}</span>
                        </p>
                      </div>
                    ))
                ) : (
                  <p>Kommentariya yo‘q</p>
                )}
              </div>
            </div>
          </div>

          {/* --------------------------- */}
          <div className="flex w-[300px] px-2 h-[8vh]] gap-2 items-center py-2">
            <div className="flex min-w-[150px] justify-between items-center">
              <Button
                disabled={currentPage === 1}
                className="w-[30px] h-[30px]"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft />
              </Button>
              <span className="px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                disabled={currentPage === totalPages}
                className="w-[30px] h-[30px]"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
            <Select defaultValue={itemsPerPage} onValueChange={setItemsPerPage}>
              <SelectTrigger className="">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={10}>10</SelectItem>
                <SelectItem value={20}>20</SelectItem>
                <SelectItem value={30}>30</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
