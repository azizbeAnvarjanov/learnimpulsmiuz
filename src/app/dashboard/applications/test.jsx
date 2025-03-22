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
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [result, setResult] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchApplications() {
    let { data, error } = await supabase.from("applications").select(`
      id,
      status,
      created_at,
      result_application,
      student_application,
      students(*),
      taqsimlovchi:employees!applications_taqsimlovchi_fkey(*),
      bajaruvchi:employees!applications_bajaruvchi_fkey(*)
    `).order("created_at", { ascending: false });
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

  const handleCancelApplication = async (applicationId) => {
    if (!result) return toast.error("Ariza natijasini kiriting!");
    
    const { error } = await supabase
      .from("applications")
      .update({ status: "Bekor qilindi", result_application: result })
      .eq("id", applicationId);
    if (error) return console.error(error);

    toast.success("Ariza bekor qilindi!");
    fetchApplications();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Yuborildi": return "text-blue-500";
      case "Ko‘rib chiqilmoqda": return "text-yellow-500";
      case "Ariza tugatildi": return "text-green-500";
      case "Bekor qilindi": return "text-red-500";
      default: return "";
    }
  };

  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const paginatedApplications = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div>
          <label className="mr-2">Sahifadagi arizalar soni:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border p-2"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Talaba</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Taqsimlovchi</TableHead>
            <TableHead>Bajaruvchi</TableHead>
            <TableHead>Ko‘rish</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.students?.fio || "Noma’lum"}</TableCell>
              <TableCell className={getStatusColor(app.status)}>{app.status}</TableCell>
              <TableCell>
                {app.taqsimlovchi ? app.taqsimlovchi.fio : "Tayinlanmagan"}
              </TableCell>
              <TableCell>
                {app.bajaruvchi ? app.bajaruvchi.fio : "Tayinlanmagan"}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleView(app)}>Ko‘rish</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Oldingi</Button>
        <span>{currentPage} / {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Keyingi</Button>
      </div>
    </div>
  );
}
