"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { Plus, Trash2, Pencil, Search, Image as ImageIcon } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AxiosError } from "axios";

// Interface
interface Produk {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  gambar: string;
  kategori: { id: number; nama: string };
  kategoriId: number; // Buat keperluan edit
}

interface Kategori {
  id: number;
  nama: string;
}

export default function ProdukPage() {
  const [data, setData] = useState<Produk[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // State Form
  const [form, setForm] = useState({
    nama: "",
    harga: "",
    stok: "",
    kategoriId: "",
  });
  const [file, setFile] = useState<File | null>(null); // State khusus File

  // URL Gambar Backend
  const BASE_URL = "http://localhost:5000/uploads/";

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      const [resProd, resKat] = await Promise.all([
        api.get("/produk"),
        api.get("/kategori"),
      ]);
      setData(resProd.data.data || []);
      setKategoris(resKat.data.data || []);
    } catch (error) {
      toast.error("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HANDLE SUBMIT (CREATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      
      const formData = new FormData();
      formData.append("nama", form.nama);
      formData.append("harga", form.harga);
      formData.append("stok", form.stok);
      formData.append("kategoriId", form.kategoriId); 
      
      if (file) {
        formData.append("gambar", file); 
      }

      await api.post("/produk", formData);

      toast.success("Produk berhasil disimpan!");
      setModalOpen(false);
      resetForm();
      fetchData();

    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error);
        toast.error(error.response?.data?.message || "Gagal simpan produk");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- 3. HANDLE DELETE ---
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await api.delete(`/produk/${id}`);
      toast.success("Produk dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal hapus" + error);
    }
  };

  const resetForm = () => {
    setForm({ nama: "", harga: "", stok: "", kategoriId: "" });
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Data Produk</h1>
        
        {/* Modal Tambah */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#468284] hover:bg-[#366365]">
              <Plus className="mr-2 h-4 w-4" /> Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nama Produk</label>
                <Input 
                  required 
                  value={form.nama} 
                  onChange={e => setForm({...form, nama: e.target.value})}
                  placeholder="Contoh: Nasi Goreng" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Harga (Rp)</label>
                    <Input 
                      required type="number"
                      value={form.harga} 
                      onChange={e => setForm({...form, harga: e.target.value})}
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Stok</label>
                    <Input 
                      required type="number"
                      value={form.stok} 
                      onChange={e => setForm({...form, stok: e.target.value})}
                    />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select onValueChange={(val) => setForm({...form, kategoriId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoris.map((kat) => (
                        <SelectItem key={kat.id} value={kat.id.toString()}>
                            {kat.nama}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Gambar Produk</label>
                <div className="flex items-center gap-2">
                    <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="cursor-pointer"
                    />
                </div>
                <p className="text-xs text-gray-500">*Format: JPG, PNG (Max 2MB)</p>
              </div>

              <Button type="submit" className="w-full bg-[#468284]" disabled={submitLoading}>
                {submitLoading ? "Mengupload..." : "Simpan Produk"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Img</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                    <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100">
                        <Image 
                            src={item.gambar ? `${BASE_URL}${item.gambar}` : "/placeholder.png"} 
                            alt="" fill className="object-cover" unoptimized 
                            onError={(e) => e.currentTarget.src = "https://placehold.co/100?text=No"}
                        />
                    </div>
                </TableCell>
                <TableCell className="font-medium">{item.nama}</TableCell>
                <TableCell>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {item.kategori?.nama || "-"}
                    </span>
                </TableCell>
                <TableCell>Rp {item.harga.toLocaleString("id-ID")}</TableCell>
                <TableCell>{item.stok}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && !loading && (
            <div className="text-center p-10 text-gray-500">Belum ada produk</div>
        )}
      </div>
    </div>
  );
}