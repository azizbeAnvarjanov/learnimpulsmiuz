"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DashboardNavbar from "../dashboard/DashboardNavbar";

const AdminPage = () => {
  const router = useRouter();

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== "Super Admin") {
        router.push("/"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
      }
    } else {
      router.push("/login"); // Agar cookie bo‘lmasa, login sahifasiga qaytarish
    }
  }, []);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fio: "",
    role: "Admin",
    login: "",
    password: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    const { data, error } = await supabase.from("employees").select("*");
    if (!error) setEmployees(data);
  }

  async function handleSubmit() {
    if (editingUser) {
      await supabase
        .from("employees")
        .update(formData)
        .eq("id", editingUser.id);
    } else {
      await supabase.from("employees").insert(formData);
    }
    fetchEmployees();
    setOpen(false);
  }

  async function handleDelete(id) {
    await supabase.from("employees").delete().eq("id", id);
    fetchEmployees();
  }

  return (
    <div>
      <DashboardNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Panel - Employees</h1>
        <Button
          onClick={() => {
            setOpen(true);
            setEditingUser(null);
            setFormData({
              fio: "",
              role: "Admin",
              login: "",
              password: "",
            });
          }}
        >
          Add Employee
        </Button>
        <table className="w-full mt-4 border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Full Name</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Login</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="text-center border">
                <td className="border p-2">{emp.fio}</td>
                <td className="border p-2">{emp.role}</td>
                <td className="border p-2">{emp.login}</td>
                <td className="border p-2">{emp.password}</td>
                <td className="border p-2 space-x-2">
                  <Button
                    onClick={() => {
                      setEditingUser(emp);
                      setFormData(emp);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(emp.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>
              {editingUser ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
            <Input
              placeholder="Full Name"
              value={formData.fio}
              onChange={(e) =>
                setFormData({ ...formData, fio: e.target.value })
              }
            />

            <Select
              defaultValue={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Login"
              value={formData.login}
              onChange={(e) =>
                setFormData({ ...formData, login: e.target.value })
              }
            />
            <Input
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type="text"
            />
            <Button onClick={handleSubmit}>
              {editingUser ? "Update" : "Create"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPage;
