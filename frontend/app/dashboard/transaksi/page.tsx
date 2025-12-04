"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Tag, User 
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
  kategori: { id: number; nama: string }; // Sesuaikan struktur backend
}

interface CartItem extends Produk {
  qty: number;
}

interface Member {
  id: number;
  nama: string;
  noTelepon : string;
}

interface Diskon {
  id: number;
  nama: string;
  persen: number;
  min_transaksi : number;
  tanggal_mulai : Date;
  tanggal_akhir : Date;
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
  const [loadingPay, setLoadingPay] = useState(false);

  const BASE_URL = "http://localhost:3000/upload/";

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resMem, resDisk, resKat] = await Promise.all([
          api.get("/produk"),
          api.get("/member"),
          api.get("/diskon"),
          api.get("/kategori")
        ]);
        
        // Handle response wrapper (data.data atau data)
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
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > item.stok) return item;
        if (newQty < 1) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // --- 3. HITUNG TOTAL (Estimasi UI) ---
  const subtotal = cart.reduce((acc, item) => acc + item.harga * item.qty, 0);
  
  let diskonVal = 0;
  if (selectedDiskon) {
    const d = diskons.find(item => item.id === Number(selectedDiskon));
    if (d) {
         diskonVal = (subtotal * d.persen) / 100;
    }
  }
  const grandTotal = Math.max(0, subtotal - diskonVal);

  // --- 4. CHECKOUT ---
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Keranjang kosong!");
    setLoadingPay(true);

    try {
      const payload = {
        memberId: selectedMember ? Number(selectedMember) : null,
        diskonId: selectedDiskon ? Number(selectedDiskon) : null,
        items: cart.map(item => ({ produkId: item.id, qty: item.qty })),
        // Tambahan: Kalau backend butuh input bayar tunai, tambahkan input field di UI nanti
        bayar: grandTotal // Sementara anggap bayar pas dulu
      };

      await api.post("/transaksi", payload);
      toast.success("Transaksi Berhasil!");
      
      setCart([]);
      setSelectedMember("");
      setSelectedDiskon("");
      
      // Refresh stok
      const res = await api.get("/produk");
      setProducts(res.data.data || []);

    } catch (error) {
      if(error instanceof AxiosError){
        toast.error(error.response?.data?.message || "Transaksi Gagal");
      }
    } finally {
      setLoadingPay(false);
    }
  };

  // Helper Format
  const rp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  // Filter Produk
  const filteredProducts = products.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchKat = selectedKategori === 0 || (p.kategori?.id === selectedKategori);
    return matchSearch && matchKat;
  });

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 overflow-hidden">
      
      {/* === KIRI: KATALOG === */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Filter Kategori & Search */}
        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Button 
                    variant={selectedKategori === 0 ? "default" : "outline"} 
                    size="sm" onClick={() => setSelectedKategori(0)}
                    className={selectedKategori === 0 ? "bg-[#468284]" : ""}
                >
                    Semua
                </Button>
                {kategoris.map((k) => (
                    <Button 
                        key={k.id} variant={selectedKategori === k.id ? "default" : "outline"} 
                        size="sm" onClick={() => setSelectedKategori(k.id)}
                        className={selectedKategori === k.id ? "bg-[#468284]" : ""}
                    >
                        {k.nama}
                    </Button>
                ))}
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Cari menu..." className="pl-9 h-9" 
                    value={search} onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* Grid */}
        <ScrollArea className="flex-1 pr-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-20">
            {filteredProducts.map((prod) => (
              <Card 
                key={prod.id} 
                className="cursor-pointer hover:border-[#468284] hover:shadow-md transition-all group overflow-hidden"
                onClick={() => addToCart(prod)}
              >
                <div className="relative h-28 w-full bg-gray-100">
                  <Image 
                    src={prod.gambar ? `${BASE_URL}${prod.gambar}` : "/placeholder.png"} 
                    alt={prod.nama} fill className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                    onError={(e) => e.currentTarget.src = "https://placehold.co/400?text=No+Image"}
                  />
                  <Badge className="absolute top-1 right-1 bg-white/90 text-black text-[10px] hover:bg-white">
                    Stok: {prod.stok}
                  </Badge>
                </div>
                <div className="p-2">
                  <h3 className="font-bold text-sm truncate text-gray-700">{prod.nama}</h3>
                  <p className="text-[#468284] font-bold text-sm">{rp(prod.harga)}</p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* === KANAN: KERANJANG === */}
      <Card className="w-[380px] flex flex-col h-full shadow-xl border-l-4 border-[#468284]">
        <div className="p-3 border-b bg-gray-50 font-bold text-[#468284] flex items-center gap-2">
          <ShoppingCart size={20} /> Keranjang Belanja
        </div>

        <ScrollArea className="flex-1 p-3 bg-white">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 text-sm">Keranjang Kosong</div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-2 items-center border rounded-lg p-2 bg-gray-50">
                   <div className="w-10 h-10 relative rounded overflow-hidden shrink-0 border">
                      <Image src={item.gambar ? `${BASE_URL}${item.gambar}` : ""} alt="" fill className="object-cover" unoptimized />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.nama}</p>
                      <p className="text-[10px] text-gray-500">{rp(item.harga)}</p>
                   </div>
                   <div className="flex items-center gap-1 bg-white border rounded">
                      <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, -1)}} className="p-1 hover:bg-gray-100"><Minus size={12}/></button>
                      <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={(e) => {e.stopPropagation(); updateQty(item.id, 1)}} className="p-1 hover:bg-gray-100"><Plus size={12}/></button>
                   </div>
                   <button onClick={() => removeItem(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 bg-gray-50 border-t space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
                <select className="border p-1 rounded text-xs" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                    <option value="">-- Member --</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
                <select className="border p-1 rounded text-xs" value={selectedDiskon} onChange={e => setSelectedDiskon(e.target.value)}>
                    <option value="">-- Voucher --</option>
                    {diskons.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg text-gray-800">
                <span>Total</span>
                <span>{rp(grandTotal)}</span>
            </div>
            <Button 
                className="w-full bg-[#468284] hover:bg-[#356163]" 
                disabled={cart.length === 0 || loadingPay}
                onClick={handleCheckout}
            >
                {loadingPay ? "Memproses..." : "Bayar Sekarang"}
            </Button>
        </div>
      </Card>
    </div>
  );
} 