"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react"; // +Pencil

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AxiosError } from "axios";

interface Member {
  id: number;
  nama: string;
  noTelepon: string;
}

export default function MemberPage() {
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nama: "", noTelepon: "" });

  const fetchData = async () => {
    try {
      const res = await api.get("/member");
      setData(res.data.data || []);
    } catch (e) { toast.error("Gagal load data"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- RESET FORM ---
  const resetForm = () => {
    setForm({ nama: "", noTelepon: "" });
    setIsEdit(false);
    setEditId(null);
  };

  // --- HANDLE EDIT ---
  const handleEdit = (item: Member) => {
    setForm({ nama: item.nama, noTelepon: item.noTelepon });
    setEditId(item.id);
    setIsEdit(true);
    setOpen(true);
  };

  // --- SUBMIT (CREATE / UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(isEdit && editId) {
        await api.put(`/member/${editId}`, form);
        toast.success("Member diupdate");
      } else {
        await api.post("/member", form);
        toast.success("Member ditambah");
      }
      setOpen(false);
      resetForm();
      fetchData();
    } catch (e) {
      if (e instanceof AxiosError) {
        toast.error(e.response?.data?.message || "Gagal simpan member");
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/member/${id}`);
      toast.success("Terhapus");
      fetchData();
    } catch (e) { toast.error("Gagal hapus"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Member Restoran</h1>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#468284] hover:bg-[#366365]"><Plus className="mr-2 h-4 w-4" /> Tambah Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isEdit ? "Edit Member" : "Tambah Member"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Nama Member" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
              <Input placeholder="No Telepon (08...)" type="number" value={form.noTelepon} onChange={e => setForm({...form, noTelepon: e.target.value})} required />
              <Button type="submit" className="w-full bg-[#468284]">{isEdit ? "Update" : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>No Telepon</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="font-bold">{item.nama}</TableCell>
                  <TableCell>{item.noTelepon}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(item)}>
                        <Pencil size={16} />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                                <Trash2 size={16} />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Hapus member ini?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}