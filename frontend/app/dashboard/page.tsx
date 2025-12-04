"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  TrendingUp, ShoppingCart, DollarSign, AlertCircle, Package 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface TokenPayload {
  role: string;
  nama: string;
}

interface ProdukTerlaris {
  nama: string;
  terjual: number;
}

interface StokMenipis {
  nama: string;
  stok: number;
}

interface DashboardStats {
  summary: {
    total_penjualan: number;
    total_omset: number;
    total_diskon: number;
  };
  analysis: {
    produk_terlaris: ProdukTerlaris[];
    stok_menipis: StokMenipis[];
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const userRole = decoded.role.toUpperCase();
      setRole(userRole);

      if (userRole === "KASIR") {
        router.replace("/dashboard/transaksi");
      } else if (userRole === "ADMIN") {
        fetchDashboardData();
      }
    } catch (error) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/laporan/dashboard-admin");
      setStats(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500 font-medium">Memuat Data...</div>;
  }


  if (role === "KASIR") return null;

  return (
    <div className="space-y-6">
      
      
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan operasional toko hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        

        <Card className="rounded-lg border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Omset</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              Rp {stats?.summary?.total_omset?.toLocaleString("id-ID") || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pendapatan bersih</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.summary?.total_penjualan || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Transaksi berhasil</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Diskon</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              Rp {stats?.summary?.total_diskon?.toLocaleString("id-ID") || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Potongan diberikan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
            <Package className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Produk Terlaris</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10">Nama Produk</TableHead>
                <TableHead className="text-right h-10">Terjual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.analysis?.produk_terlaris?.map((item, idx) => (
                <TableRow key={idx} className="h-10">
                  <TableCell className="font-medium text-sm">{item.nama}</TableCell>
                  <TableCell className="text-right text-sm">{item.terjual}</TableCell>
                </TableRow>
              ))}
              {(!stats?.analysis?.produk_terlaris || stats.analysis.produk_terlaris.length === 0) && (
                  <TableRow><TableCell colSpan={2} className="text-center text-xs text-gray-400 py-4">Data kosong</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Stok Menipis</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10">Nama Produk</TableHead>
                <TableHead className="text-right h-10">Sisa Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.analysis?.stok_menipis?.map((item, idx) => (
                <TableRow key={idx} className="h-10">
                  <TableCell className="font-medium text-sm text-gray-700">{item.nama}</TableCell>
                  <TableCell className="text-right font-bold text-gray-700 text-sm">{item.stok}</TableCell>
                </TableRow>
              ))}
              {(!stats?.analysis?.stok_menipis || stats.analysis.stok_menipis.length === 0) && (
                  <TableRow><TableCell colSpan={2} className="text-center text-xs text-gray-400 py-4">Stok aman</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}