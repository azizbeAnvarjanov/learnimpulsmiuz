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
import { ChevronLeft, ChevronRight, RefreshCcw, SendHorizontal } from "lucide-react";
import DashbNavbar from "@/app/dashboard/DashboardNavbar";
import { Input } from "@/components/ui/input";

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
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setApplications(data);
  }
  useEffect(() => {
    fetchApplications();
  }, []);

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
    setSelectedApplication(application);
    setIsDialogOpen(true);
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
        return "bg-blue-400 text-white";
      case "Ko‘rib chiqilmoqda":
        return "bg-yellow-400 text-white";
      case "Ariza tugatildi":
        return "bg-green-400 text-white";
      case "Bekor qilindi":
        return "bg-red-400 text-white";
      default:
        return "";
    }
  };

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const paginatedApplications = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <DashbNavbar />
      <div className="p-2">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-2xl">Arzialar</h1>
          <Button
            onClick={fetchApplications}
            className="w-[35px] h-[35px] grid place-items-center"
            variant="outline"
          >
            <RefreshCcw />
          </Button>
        </div>
        <br />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Talaba</TableHead>
              <TableHead>Kursi</TableHead>
              <TableHead>Guruhi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Taqsimlovchi</TableHead>
              <TableHead>Bajaruvchi</TableHead>
              <TableHead>Ko‘rish</TableHead>
              <TableHead>Komentariyalar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.map((app, idx) => (
              <TableRow key={app.id}>
                <TableCell className="w-[50px] text-center">
                  {idx + 1}
                </TableCell>
                <TableCell>{app.students?.fio || "Noma’lum"}</TableCell>
                <TableCell>{app.students?.kurs || "Noma’lum"}</TableCell>
                <TableCell>{app.students?.guruh || "Noma’lum"}</TableCell>
                <TableCell className={getStatusColor(app.status)}>
                  {app.status}
                </TableCell>
                <TableCell>
                  {app.taqsimlovchi ? app.taqsimlovchi.fio : "Tayinlanmagan"}
                </TableCell>
                <TableCell>
                  {app.bajaruvchi ? app.bajaruvchi.fio : "Tayinlanmagan"}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleView(app)}>Ko‘rish</Button>
                </TableCell>
                <TableCell>
                  {app.comments?.length
                    ? app.comments.length + " ta"
                    : "Kommentariya yo‘q"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex w-[300px] gap-2 items-center py-2">
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Ariza Tafsilotlari</DialogTitle>
            <DialogClose onClick={() => setIsDialogOpen(false)} />
            <div className="flex items-start">
              <div className="h-full w-full p-5">
                {selectedApplication && (
                  <div>
                    <p>
                      <strong>Talaba:</strong>{" "}
                      {selectedApplication.students?.fio}
                    </p>
                    <p>
                      <strong>Kursi:</strong>{" "}
                      {selectedApplication.students?.kurs}
                    </p>
                    <p>
                      <strong>Guruxi:</strong>{" "}
                      {selectedApplication.students?.guruh}
                    </p>
                    <br />
                    <p>
                      <strong>Ariza:</strong>{" "}
                      {selectedApplication.student_application}
                    </p>
                    <br />
                    <p>
                      <strong>Natija:</strong>{" "}
                      {selectedApplication.result_application}
                    </p>
                    <br />

                    {/* <select onChange={(e) => setSelectedEmployee(e.target.value)}>
                  <option value="">Bajaruvchini tanlang</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fio}
                    </option>
                  ))}
                </select> */}
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
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-l h-full w-full p-4">
                <div className="overflow-y-auto p-1">
                <div className="flex items-center justify-between gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Kommentariya yozish..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="border p-2 w-full"
                />
                <Button
                  onClick={handleAddComment}
                  className="w-[35px] h-[35px]"
                >
                  <SendHorizontal />
                </Button>
              </div>
                  {selectedApplication?.comments?.length ? (
                    selectedApplication?.comments.map((comment, index) => (
                      <div key={index} className="p-2 border mb-2 rounded-md">
                        <div className="flex items-center justify-between">
                          <p className="text-[15px] font-semibold">
                            {comment.user}
                          </p>

                          <p className="text-[12px]">{comment.timestamp}</p>
                        </div>
                        <p className="">
                          <span className="">{comment.text}</span>{" "}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>Kommentariya yo‘q</p>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
