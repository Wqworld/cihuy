"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Package, Printer, FileText } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Interface
interface LaporanPenjualanItem {
  id: number;
  tglTransaksi: string;
  total: number;
  user: { nama: string } | null;
  member: { nama: string } | null;
}

interface LaporanStokItem {
  id: number;
  nama_barang: string;
  kategori: string;
  harga: number;
  stok_saat_ini: number;
  status: "KRITIS" | "Aman";
}

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("penjualan");
  
  const today = new Date().toISOString().split('T')[0];
  const [tglMulai, setTglMulai] = useState(today);
  const [tglAkhir, setTglAkhir] = useState(today);

  // State Data
  const [dataPenjualan, setDataPenjualan] = useState<LaporanPenjualanItem[]>([]);
  const [dataStok, setDataStok] = useState<LaporanStokItem[]>([]);
  const [summary, setSummary] = useState({ total_omset: 0, jumlah_transaksi: 0 });
  const [loading, setLoading] = useState(false);
  
  // FIX HYDRATION ERROR: State khusus tanggal cetak
  const [tanggalCetak, setTanggalCetak] = useState("");

// --- 1. FETCH LAPORAN PENJUALAN ---
  const fetchPenjualan = async () => {
    setLoading(true);
    try {
      console.log(`DEBUG: Fetching data dari ${tglMulai} sampai ${tglAkhir}`); // <--- CCTV 1

      const res = await api.get(`/laporan/penjualan?tgl_mulai=${tglMulai}&tgl_akhir=${tglAkhir}`);
      
      console.log("DEBUG: Response Backend:", res.data); // <--- CCTV 2

      setDataPenjualan(res.data.data || []);
      setSummary(res.data.ringkasan || { total_omset: 0, jumlah_transaksi: 0 });
    } catch (error) {
      console.error("DEBUG: Error Fetch:", error); // <--- CCTV 3
      toast.error("Gagal muat laporan penjualan");
    } finally {
      setLoading(false);
    }
  };

  const fetchStok = async () => {
    setLoading(true);
    try {
      const res = await api.get("/laporan/stok");
      setDataStok(res.data.data || []);
    } catch (error) {
      toast.error("Gagal muat laporan stok");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "penjualan") {
      fetchPenjualan();
    } else {
      fetchStok();
    }
    
    // FIX HYDRATION: Set tanggal cetak hanya di client
    setTanggalCetak(new Date().toLocaleString("id-ID"));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tglMulai, tglAkhir]);

  const rp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  
  const fmtDate = (d: string) => {
    if(!d) return "-";
    return new Date(d).toLocaleString("id-ID", {
       day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laporan & Analisis</h1>
          <p className="text-gray-500">
             {/* FIX: Gunakan state tanggalCetak */}
             <span className="hidden print:block text-sm font-bold">Laporan Dicetak pada: {tanggalCetak}</span>
             <span className="print:hidden">Pantau kinerja toko dan stok barang</span>
          </p>
        </div>
        
        <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="gap-2 border-gray-300">
                <Printer size={16}/> Cetak PDF
            </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1 print:hidden">
        <button 
            onClick={() => setActiveTab("penjualan")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === "penjualan" ? "bg-[#468284] text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
        >
            <div className="flex items-center gap-2"> <FileText size={16}/> Laporan Penjualan </div>
        </button>
        <button 
            onClick={() => setActiveTab("stok")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === "stok" ? "bg-[#468284] text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
        >
            <div className="flex items-center gap-2"> <Package size={16}/> Laporan Stok </div>
        </button>
      </div>

      {/* --- KONTEN TAB PENJUALAN --- */}
      {activeTab === "penjualan" && (
        <div className="space-y-6">
            <Card className="bg-gray-50 border shadow-none print:hidden">
                <CardContent className="p-4 flex flex-wrap gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Dari Tanggal</label>
                        <Input type="date" value={tglMulai} onChange={e => setTglMulai(e.target.value)} className="bg-white" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Sampai Tanggal</label>
                        <Input type="date" value={tglAkhir} onChange={e => setTglAkhir(e.target.value)} className="bg-white" />
                    </div>
                    <div className="flex-1 text-right">
                        <p className="text-xs text-gray-500">Total Omset</p>
                        <p className="text-2xl font-bold text-emerald-600">{rp(summary.total_omset)}</p>
                        <p className="text-xs text-gray-400">{summary.jumlah_transaksi} Transaksi</p>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden print:border-none print:shadow-none">
                <div className="hidden print:block p-4 font-bold text-xl text-center border-b">
                    Laporan Penjualan ({tglMulai} s/d {tglAkhir})
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Kasir</TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead className="text-right">Total Bayar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : dataPenjualan.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">Tidak ada transaksi</TableCell></TableRow>
                        ) : (
                            dataPenjualan.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs text-gray-500">#{item.id}</TableCell>
                                    <TableCell>{fmtDate(item.tglTransaksi)}</TableCell>
                                    <TableCell className="font-medium">{item.user?.nama || "Admin"}</TableCell>
                                    <TableCell>{item.member?.nama || "-"}</TableCell>
                                    <TableCell className="text-right font-bold text-[#468284]">{rp(item.total)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      )}

      {/* --- KONTEN TAB STOK --- */}
      {activeTab === "stok" && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden print:border-none print:shadow-none">
            <div className="hidden print:block p-4 font-bold text-xl text-center border-b">Laporan Stok Barang</div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-center">Sisa Stok</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                    ) : (
                        dataStok.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-bold">{item.nama_barang}</TableCell>
                                <TableCell>{item.kategori}</TableCell>
                                <TableCell className="text-right">{rp(item.harga)}</TableCell>
                                <TableCell className="text-center font-bold">{item.stok_saat_ini}</TableCell>
                                <TableCell className="text-center">
                                    {item.stok_saat_ini < 5 ? (
                                        <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-red-200">KRITIS</Badge>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-green-200">Aman</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
}