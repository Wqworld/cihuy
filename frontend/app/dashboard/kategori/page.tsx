"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { Plus, Trash2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TokenPayload { role: string; }
interface Kategori { id: number; nama: string; }

export default function KategoriPage() {
  const [data, setData] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState<number | null>(null); 
  const [isEdit, setIsEdit] = useState(false); 

  const fetchData = async () => {
    try {
      const res = await api.get("/kategori");
      setData(res.data.data || []);
    } catch (e) {
      toast.error("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const token = localStorage.getItem("token");
    if(token) {
        try {
            const decoded = jwtDecode<TokenPayload>(token);
            setUserRole(decoded.role.toUpperCase());
        } catch(e) {}
    }
  }, []);

  const handleEdit = (item: Kategori) => {
    setIsEdit(true);
    setEditId(item.id);
    setNama(item.nama);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editId) {
        await api.put(`/kategori/${editId}`, { nama });
        toast.success("Kategori diupdate");
      } else {
        await api.post("/kategori", { nama });
        toast.success("Kategori ditambah");
      }
      
      setOpen(false);
      setNama("");
      setIsEdit(false);
      setEditId(null);
      fetchData();
    } catch (e) {
      toast.error("Gagal simpan kategori");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/kategori/${id}`);
      toast.success("Terhapus");
      fetchData();
    } catch (e) {
      toast.error("Gagal hapus");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kategori</h1>
        
        {userRole === "ADMIN" && (
            <Dialog open={open} onOpenChange={(val) => {
                setOpen(val);
                if(!val) { 
                    setNama(""); 
                    setIsEdit(false);
                    setEditId(null);
                }
            }}>
            <DialogTrigger asChild>
                <Button className="bg-[#468284] hover:bg-[#366365]">
                    <Plus className="mr-2 h-4 w-4"/> Tambah
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Nama Kategori" value={nama} onChange={e => setNama(e.target.value)} required />
                <Button type="submit" className="w-full bg-[#468284]">
                    {isEdit ? "Update" : "Simpan"}
                </Button>
                </form>
            </DialogContent>
            </Dialog>
        )}
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Nama</TableHead>
              {userRole === "ADMIN" && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={item.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="font-bold">{item.nama}</TableCell>
                
                {userRole === "ADMIN" && (
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
                                <AlertDialogHeader><AlertDialogTitle>Yakin hapus?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500">Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}