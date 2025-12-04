"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, User, Shield } from "lucide-react";
import { AxiosError } from "axios"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserData {
  id: number;
  nama: string;
  username: string;
  role: "ADMIN" | "KASIR"; 
  createdAt: string;
}

interface UserForm {
  nama: string;
  username: string;
  password: string;
  role: "ADMIN" | "KASIR";
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export default function UserPage() {
  // State dengan Tipe Data yang Jelas
  const [data, setData] = useState<UserData[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form, setForm] = useState<UserForm>({
    nama: "",
    username: "",
    password: "",
    role: "KASIR" 
  });

  const fetchData = async () => {
    try {
      // Gunakan Generic Type pada api.get
      const res = await api.get<ApiResponse<UserData[]>>("/kasir"); 
      setData(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ nama: "", username: "", password: "", role: "KASIR" });
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (item: UserData) => {
    setForm({ 
        nama: item.nama, 
        username: item.username, 
        password: "", 
        role: item.role 
    });
    setEditId(item.id);
    setIsEdit(true);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (isEdit && editId) {
        const payload = {
            nama: form.nama,
            username: form.username,
            role: form.role,
            ...(form.password ? { password: form.password } : {}) 
        };

        await api.put(`/users/${editId}`, payload);
        toast.success("User berhasil diupdate");
      } else {
        if (!form.password) {
            toast.error("Password wajib diisi untuk user baru");
            setSubmitLoading(false);
            return;
        }
        await api.post("/users", form);
        toast.success("User berhasil dibuat");
      }

      setOpen(false);
      resetForm();
      fetchData();

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Gagal menyimpan user");
      } else {
        toast.error("Terjadi kesalahan sistem");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success("User dihapus");
      fetchData();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Gagal menghapus user");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
            <p className="text-gray-500 text-sm">Kelola akun Admin dan Kasir</p>
        </div>
        
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#468284] hover:bg-[#366365]">
                <Plus className="mr-2 h-4 w-4"/> Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isEdit ? "Edit Akun" : "Tambah Akun Baru"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Nama Lengkap</label>
                <Input 
                    placeholder="Nama Lengkap" 
                    value={form.nama} 
                    onChange={e => setForm({...form, nama: e.target.value})} 
                    required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Username (Login)</label>
                <Input 
                    placeholder="username" 
                    value={form.username} 
                    onChange={e => setForm({...form, username: e.target.value})} 
                    required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                    Password {isEdit && <span className="text-red-400 text-[10px]">(Kosongkan jika tidak diganti)</span>}
                </label>
                <Input 
                    type="password"
                    placeholder="******" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    required={!isEdit}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Role</label>
                <Select 
                    value={form.role} 
                    onValueChange={(val: "ADMIN" | "KASIR") => setForm({...form, role: val})}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="KASIR">Kasir</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={submitLoading} className="w-full bg-[#468284]">
                {submitLoading ? "Menyimpan..." : (isEdit ? "Update Akun" : "Buat Akun")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">Belum ada user</TableCell></TableRow>
              ) : (
                data.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="font-bold flex items-center gap-2">
                        <div className={`p-2 rounded-full ${item.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.role === 'ADMIN' ? <Shield size={16}/> : <User size={16}/>}
                        </div>
                        {item.nama}
                    </TableCell>
                    <TableCell className="text-gray-600">@{item.username}</TableCell>
                    <TableCell>
                        {item.role === 'ADMIN' ? (
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Admin</Badge>
                        ) : (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Kasir</Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(item)}>
                            <Pencil size={16} />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                                    <Trash2 size={16}/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus user ini?</AlertDialogTitle>
                                    <AlertDialogDescription>Akun @{item.username} akan dihapus permanen.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600">Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}