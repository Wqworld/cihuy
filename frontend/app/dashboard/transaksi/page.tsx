"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { jwtDecode } from "jwt-decode"; // Butuh buat ambil ID Kasir
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Banknote,
} from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AxiosError } from "axios";

// --- TIPE DATA ---
interface Produk {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  gambar: string;
  kategori: { id: number; nama: string };
}

interface CartItem extends Produk {
  qty: number;
}

interface TokenPayload {
  id: number; // ID Kasir ada di sini
}

interface Diskon {
  id: number;
  nama: string;
  persen: number;
  min_transaksi: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
}
interface Member {
  id: number;
  nama: string;
  noTelepon: string;
}

interface Kategori {
  id: number;
  nama: string;
}
export default function TransaksiPage() {
  // Data Master
  const [products, setProducts] = useState<Produk[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [diskons, setDiskons] = useState<Diskon[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);

  // State Transaksi
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState(0);

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedDiskon, setSelectedDiskon] = useState("");
  const [uangBayar, setUangBayar] = useState(""); // Input uang tunai

  const [loadingPay, setLoadingPay] = useState(false);
  const [kasirId, setKasirId] = useState<number | null>(null);

  const BASE_URL = "http://localhost:3000/api/upload/"; // Sesuaikan port

  // --- 1. FETCH DATA & TOKEN ---
  useEffect(() => {
    // Ambil ID Kasir dari Token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setKasirId(decoded.id);
      } catch (e) {}
    }

    const fetchData = async () => {
      try {
        const [resProd, resMem, resDisk, resKat] = await Promise.all([
          api.get("/produk"), // Backend: getAllProduk
          api.get("/member"),
          api.get("/diskon"),
          api.get("/kategori"),
        ]);

        setProducts(resProd.data.data || []);
        setMembers(resMem.data.data || []);
        setDiskons(resDisk.data.data || []);
        setKategoris(resKat.data.data || []);
      } catch (error) {
        toast.error("Gagal memuat data");
      }
    };
    fetchData();
  }, []);

  // --- 2. KERANJANG LOGIC ---
  const addToCart = (product: Produk) => {
    if (product.stok <= 0) return toast.error("Stok habis!");

    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        if (exist.qty >= product.stok) {
          toast.error("Stok mentok!");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty > item.stok) return item;
          if (newQty < 1) return item;
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // --- 3. HITUNG TOTAL (Sesuai Logic Backend) ---
  const subtotal = cart.reduce((acc, item) => acc + item.harga * item.qty, 0);
  let totalAkhir = subtotal;

  // A. Diskon Member 5%
  let memberDiscAmount = 0;
  if (selectedMember) {
    memberDiscAmount = subtotal * 0.05;
    totalAkhir -= memberDiscAmount;
  }

  // B. Diskon Voucher
  let voucherDiscAmount = 0;
  if (selectedDiskon) {
    const d = diskons.find((item) => item.id === Number(selectedDiskon));
    // Backend cek: totalHarga >= min_transaksi
    if (d && subtotal >= d.min_transaksi) {
      if (d.persen) {
        // Backend pakai field 'persen'
        voucherDiscAmount = (totalAkhir * d.persen) / 100;
        totalAkhir -= voucherDiscAmount;
      }
    }
  }

  // Pastikan tidak minus
  const grandTotal = Math.max(0, totalAkhir);

  // Hitung Kembalian (UI Only)
  const kembalian = Number(uangBayar) - grandTotal;

  // --- 4. CHECKOUT ---
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Keranjang kosong!");
    if (!uangBayar) return toast.error("Masukkan uang pembayaran!");
    if (Number(uangBayar) < grandTotal) return toast.error("Uang kurang!");

    setLoadingPay(true);

    try {
      const payload = {
        kasirId: kasirId, // Wajib dikirim
        memberId: selectedMember ? Number(selectedMember) : null,
        diskonId: selectedDiskon ? Number(selectedDiskon) : null,
        bayar: Number(uangBayar),
        // Format items sesuai Backend: id & quantity
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.qty,
        })),
      };

      await api.post("/transaksi", payload); // Backend: createTransaksi

      toast.success("Transaksi Berhasil!");

      // Reset
      setCart([]);
      setSelectedMember("");
      setSelectedDiskon("");
      setUangBayar("");

      // Refresh stok
      const res = await api.get("/produk");
      setProducts(res.data.data || []);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Transaksi Gagal");
      }
    } finally {
      setLoadingPay(false);
    }
  };

  // Helper Format
  const rp = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchKat =
      selectedKategori === 0 || p.kategori?.id === selectedKategori;
    return matchSearch && matchKat;
  });

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 overflow-hidden">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={selectedKategori === 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedKategori(0)}
              className={selectedKategori === 0 ? "bg-[#468284]" : ""}
            >
              Semua
            </Button>
            {kategoris.map((k) => (
              <Button
                key={k.id}
                variant={selectedKategori === k.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedKategori(k.id)}
                className={selectedKategori === k.id ? "bg-[#468284]" : ""}
              >
                {k.nama}
              </Button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari menu..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Produk */}
        <ScrollArea className="flex-1 pr-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-20">
            {filteredProducts.map((prod) => (
              <Card
                key={prod.id}
                className="max-w-60 w-full group relative overflow-hidden hover:shadow-md transition-all duration-300 border-[#468284] border-4 p-2"
                onClick={() => addToCart(prod)}
              >
                <div className="relative aspect-square w-full h-30 bg-gray-50 border-[#468284] border-4 rounded-sm">
                  <Image
                    src={
                      prod.gambar && prod.gambar !== "default.png"
                        ? `${BASE_URL}${prod.gambar}`
                        : "/placeholder.png"
                    }
                    alt={prod.nama}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/400?text=No+Image")
                    }
                  />
                  <div className="absolute top-1 right-1">
                    <Badge
                      variant={prod.stok > 0 ? "secondary" : "destructive"}
                      className="text-[15px] px-1.5 h-5 opacity-90"
                    >
                      {prod.stok}
                    </Badge>
                  </div>
                </div>
                <div className="p-2 -mt-4">
                  <h3 className="font-bold text-2xl truncate  text-gray-700">
                    {prod.nama}
                  </h3>
                  <p className="text-[#468284] font-bold text-md">
                    {rp(prod.harga)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Card className="w-[380px] flex flex-col h-full border-4 border-[#468284]">
        <div className="p-3 border-b bg-gray-50 font-bold text-[#468284] flex items-center gap-2">
          <ShoppingCart size={20} /> Item Keranjang
        </div>

        <ScrollArea className="flex-1 p-3 bg-white">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 text-sm">
              Keranjang Kosong
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2 items-center border rounded-lg p-2 bg-gray-50"
                >
                  <div className="w-10 h-10 relative rounded overflow-hidden shrink-0 border">
                    <Image
                      src={
                        item.gambar && item.gambar !== "default.png"
                          ? `${BASE_URL}${item.gambar}`
                          : "/placeholder.png"
                      }
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.nama}</p>
                    <p className="text-[10px] text-gray-500">
                      {rp(item.harga)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white border rounded">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQty(item.id, -1);
                      }}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQty(item.id, 1);
                      }}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Pembayaran */}
        <div className="p-4 bg-gray-50 border-t space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border p-1 rounded text-xs bg-white"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">-- Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama}
                </option>
              ))}
            </select>
            <select
              className="border p-1 rounded text-xs bg-white"
              value={selectedDiskon}
              onChange={(e) => setSelectedDiskon(e.target.value)}
            >
              <option value="">-- Voucher --</option>
              {diskons.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>

          <Separator />

          {/* Rincian Angka */}
          <div className="space-y-1">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Subtotal</span>
              <span>{rp(subtotal)}</span>
            </div>
            {(memberDiscAmount > 0 || voucherDiscAmount > 0) && (
              <div className="flex justify-between text-emerald-600 text-xs">
                <span>Diskon</span>
                <span>- {rp(memberDiscAmount + voucherDiscAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>{rp(grandTotal)}</span>
            </div>
          </div>

          {/* Input Bayar */}
          <div className="flex items-center gap-2 mt-2">
            <Banknote size={20} className="text-gray-500" />
            <Input
              type="number"
              placeholder="Uang Tunai"
              className="h-9 bg-white"
              value={uangBayar}
              onChange={(e) => setUangBayar(e.target.value)}
            />
          </div>

          {/* Kembalian */}
          <div className="flex justify-between text-xs font-medium text-gray-600 px-1">
            <span>Kembali:</span>
            <span className={kembalian < 0 ? "text-red-500" : "text-blue-600"}>
              {uangBayar ? rp(kembalian) : "Rp 0"}
            </span>
          </div>

          <Button
            className="w-full bg-[#468284] hover:bg-[#356163] h-10 mt-1"
            disabled={cart.length === 0 || loadingPay}
            onClick={handleCheckout}
          >
            {loadingPay ? "Memproses..." : "Bayar"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
