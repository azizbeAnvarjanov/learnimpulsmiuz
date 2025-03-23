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
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  SendHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setuser] = useState(null);

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
      // Faqat user mavjud bo'lsa chaqiramiz
      fetchApplications();
    }
  }, [user]);

  const handleView = (application) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim())
      return toast.error("Kommentariya matni bo‘sh bo‘lmasligi kerak!");

    const newCommentObject = {
      text: newComment,
      timestamp: new Date().toLocaleString(),
      user: "Bajaruvchi",
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

  console.log(selectedApplication);

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const paginatedApplications = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-2">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-2xl">Arizalar</h1>
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
            <TableHead>Komentariya</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedApplications.map((app, idx) => (
            <TableRow
              key={app.id}
              onClick={() => handleView(app)}
              className="cursor-pointer"
            >
              <TableCell className="w-[50px] text-center">{idx + 1}</TableCell>
              <TableCell>{app.students?.fio || "Noma’lum"}</TableCell>
              <TableCell>{app.students?.kurs || "Noma’lum"}</TableCell>
              <TableCell>{app.students?.guruh || "Noma’lum"}</TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell>
                {app.taqsimlovchi ? app.taqsimlovchi.fio : "Tayinlanmagan"}
              </TableCell>
              <TableCell>
                {app.bajaruvchi ? app.bajaruvchi.fio : "Tayinlanmagan"}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kommentariyalar</DialogTitle>
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
  );
}
