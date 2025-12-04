"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { jwtDecode } from "jwt-decode"; 
import { Plus, Trash2, Pencil } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AxiosError } from "axios";

interface TokenPayload { role: string; }

interface Produk {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  gambar: string;
  kategoriId: number;
  kategori: { id: number; nama: string };
}

interface Kategori { id: number; nama: string; }

export default function ProdukPage() {
  const [data, setData] = useState<Produk[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Form State
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    nama: "",
    harga: "",
    stok: "",
    kategoriId: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const BASE_URL = "http://localhost:3000/api/upload/"; 
  const fetchData = async () => {
    try {
      const [resProd, resKat] = await Promise.all([
        api.get("/produk"),
        api.get("/kategori"),
      ]);
      setData(resProd.data.data || []);
      setKategoris(resKat.data.data || []);
    } catch (e) {
      toast.error("Gagal load data");
    }
  };

  useEffect(() => {
    fetchData();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setUserRole(decoded.role.toUpperCase());
      } catch (error) { console.error("Gagal decode"); }
    }
  }, []);

  const resetForm = () => {
    setForm({ nama: "", harga: "", stok: "", kategoriId: "" });
    setFile(null);
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (item: Produk) => {
    setForm({
        nama: item.nama,
        harga: item.harga.toString(),
        stok: item.stok.toString(),
        kategoriId: item.kategoriId.toString()
    });
    setEditId(item.id);
    setIsEdit(true);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    
    try {
      const formData = new FormData();
      formData.append("nama", form.nama);
      formData.append("harga", form.harga);
      formData.append("stok", form.stok);
      formData.append("kategoriId", form.kategoriId);
      
      if (file) {
        formData.append("gambar", file);
      }

      if (isEdit && editId) {
        
        await api.put(`/produk/${editId}`, formData); 
        toast.success("Produk berhasil diupdate");
      } else {
        await api.post("/produk", formData);
        toast.success("Produk berhasil disimpan");
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (e) {
      if (e instanceof AxiosError) {
        toast.error(e.response?.data?.message || "Gagal simpan produk");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/produk/${id}`);
      toast.success("Terhapus");
      fetchData();
    } catch (e) {
      toast.error("Gagal hapus");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Produk Menu</h1>

        {userRole === "ADMIN" && (
          <Dialog open={open} onOpenChange={(val) => {
             setOpen(val);
             if(!val) resetForm(); 
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#468284] hover:bg-[#366365]">
                <Plus className="mr-2 h-4 w-4" /> Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Nama Produk"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Harga"
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Stok"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    required
                  />
                </div>
                
                <Select 
                    value={form.kategoriId} 
                    onValueChange={(val) => setForm({ ...form, kategoriId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoris.map((k) => (
                      <SelectItem key={k.id} value={k.id.toString()}>
                        {k.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500">Gambar (Kosongkan jika tidak diganti)</label>
                    <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                </div>

                <Button
                  type="submit"
                  disabled={loadingSubmit}
                  className="w-full bg-[#468284]"
                >
                  {loadingSubmit ? "Menyimpan..." : (isEdit ? "Update" : "Simpan")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {data.map((item) => (
          <Card
            key={item.id}
            className="max-w-60 w-full group relative overflow-hidden hover:shadow-md transition-all duration-300 border-[#468284] border-4 p-2"
          >
            <div className="relative aspect-square w-full h-30 bg-gray-50 border-[#468284] border-4 rounded-sm">
              <Image
                unoptimized
                src={item.gambar && item.gambar !== 'default.png' ? `${BASE_URL}${item.gambar}` : "/placeholder.png"}
                alt={item.nama}
                fill
                className="object-cover"
                onError={(e) => { e.currentTarget.src = "https://placehold.co/200?text=No+Img"; }}
              />
              <div className="absolute top-1 right-1">
                <Badge variant={item.stok > 0 ? "secondary" : "destructive"} className="text-[10px] px-1.5 h-5 opacity-90">
                  {item.stok}
                </Badge>
              </div>
            </div>

            <CardContent className="p-2 ">
              <h3 className="font-bold text-3xl -mt-4 leading-tight line-clamp-2" title={item.nama}>
                {item.nama}
              </h3>
              <p className="text-md font-medium text-muted-foreground uppercase truncate">
                {item.kategori?.nama || "-"}
              </p>

              <div className="flex items-end justify-between pt-1">
                <p className="font-bold text-xl text-[#468284]">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.harga)}
                </p>

                {userRole === "ADMIN" && (
                  <div className="flex gap-1 -mr-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:text-blue-700" onClick={() => handleEdit(item)}>
                        <Pencil size={14} />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-600">
                            <Trash2 size={14} />
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus item ini?</AlertDialogTitle>
                            <AlertDialogDescription>{item.nama} akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}