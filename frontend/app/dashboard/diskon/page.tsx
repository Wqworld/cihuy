"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Plus, Trash2, Tag, Pencil } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Diskon {
  id: number;
  nama: string;
  persen: number;
  min_transaksi: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
}

export default function DiskonPage() {
  const [data, setData] = useState<Diskon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    persen: "",
    min_transaksi: "",
    tanggal_mulai: "",
    tanggal_akhir: ""
  });

  const fetchData = async () => {
    try {
      const res = await api.get("/diskon");
      setData(res.data.data || []);
    } catch (e) {
      toast.error("Gagal load diskon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ nama: "", persen: "", min_transaksi: "", tanggal_mulai: "", tanggal_akhir: "" });
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (item: Diskon) => {
    setForm({
        nama: item.nama,
        persen: item.persen.toString(),
        min_transaksi: item.min_transaksi.toString(),
        tanggal_mulai: new Date(item.tanggal_mulai).toISOString().split('T')[0],
        tanggal_akhir: new Date(item.tanggal_akhir).toISOString().split('T')[0]
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
        await api.put(`/diskon/${editId}`, form);
        toast.success("Diskon diupdate");
      } else {
        await api.post("/diskon", form);
        toast.success("Diskon dibuat");
      }
      setOpen(false);
      resetForm();
      fetchData();
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
            toast.error(e.response?.data?.message || "Gagal proses diskon");
        }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/diskon/${id}`);
      toast.success("Terhapus");
      fetchData();
    } catch (e) { toast.error("Gagal hapus"); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("id-ID");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Diskon</h1>
        
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#468284] hover:bg-[#366365]">
                <Plus className="mr-2 h-4 w-4"/> Tambah Diskon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isEdit ? "Edit Diskon" : "Buat Diskon Baru"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nama Promo</label>
                <Input placeholder="Contoh: Diskon Kemerdekaan" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Potongan (%)</label>
                    <Input type="number" placeholder="10" value={form.persen} onChange={e => setForm({...form, persen: e.target.value})} required />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Min. Transaksi</label>
                    <Input type="number" placeholder="50000" value={form.min_transaksi} onChange={e => setForm({...form, min_transaksi: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Berlaku Dari</label>
                    <Input type="date" value={form.tanggal_mulai} onChange={e => setForm({...form, tanggal_mulai: e.target.value})} required />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Sampai</label>
                    <Input type="date" value={form.tanggal_akhir} onChange={e => setForm({...form, tanggal_akhir: e.target.value})} required />
                </div>
              </div>

              <Button type="submit" disabled={submitLoading} className="w-full bg-[#468284]">
                {submitLoading ? "Menyimpan..." : (isEdit ? "Update" : "Simpan")}
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
                <TableHead>Nama Promo</TableHead>
                <TableHead>Potongan</TableHead>
                <TableHead>Min. Belanja</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold flex items-center gap-2">
                    <Tag size={16} className="text-orange-500"/> {item.nama}
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    {item.persen}%
                  </TableCell>
                  <TableCell>
                    Rp {item.min_transaksi.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {fmtDate(item.tanggal_mulai)} - {fmtDate(item.tanggal_akhir)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => handleEdit(item)}>
                        <Pencil size={16}/>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                                <Trash2 size={16} />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Hapus diskon ini?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">Belum ada diskon aktif</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}