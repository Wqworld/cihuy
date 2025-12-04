"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password
      });

      // DEBUG: Cek isi respon di console browser (F12)
      console.log("Respon dari server:", response.data);

      // PERBAIKAN DI SINI:
      // Karena backend mengirim { data: "ey..." }, kita ambil response.data.data langsung
      const token = response.data.data;

      if (!token) {
        throw new Error("Token tidak ditemukan dalam respon server");
      }

      localStorage.setItem("token", token);
      toast.success("Login Berhasil! Mengalihkan...");
      
      setTimeout(() => {
        router.replace("/dashboard");
      }, 500);

    } catch (error) { // Gunakan any atau type error yang sesuai
      console.error("Error Login:", error);
      
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.message || "Gagal Login, periksa koneksi backend";
        toast.error(msg);
      } else {
        console.error("Error Login:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="w-full h-screen justify-center items-center flex bg-[#EDEDED]">
      <div className="md:w-220 md:h-100 flex border-[#68868C] border-3 rounded-xl overflow-hidden shadow-2xl bg-white">
        
        <div className="bg-[#3E3E3E] rounded-lg max-w-60 w-full justify-center items-center flex flex-col text-center outline-3 outline-[#68868C] p-6 relative z-10">
          <div className="relative w-32 h-32 mb-4">
             <Image
                src="/Logo.png"
                alt="logo"
                fill
                className="object-contain"
                priority
             />
          </div>
          <h1 className="font-bold text-2xl text-white tracking-wide">KasirKu</h1>
          <h2 className="font-medium text-xs text-gray-300 mt-2">
            Kasir Optimal untuk sajian istimewa
          </h2>
        </div>

        <div className="w-full m-15 mx-10 border-l-4 border-[#405559] px-8 py-10 flex flex-col justify-center">
          <div className="mb-6">
              <p className="text-2xl font-bold text-[#405559] mb-2">
                SELAMAT DATANG KEMBALI!
              </p>
              <p className="text-sm font-medium text-[#535555] leading-relaxed">
                Login untuk memberikan pelayanan terbaik atau kelola restoran Anda
                dengan data yang akurat.
              </p>
          </div>

          <div className="w-full max-w-sm">
            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-2">
                <Label className="text-[#68868C] font-bold">Username</Label>
                <Input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-[#68868C] border-2 focus:border-[#405559] focus:ring-1 focus:ring-[#405559] text-[#4d4d4d] h-11"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[#68868C] font-bold">Password</Label>
                <Input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#68868C] border-2 focus:border-[#405559] focus:ring-1 focus:ring-[#405559] text-[#4d4d4d] h-11"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 bg-[#68868C] hover:bg-[#405559] text-white font-bold text-md rounded-lg transition-all duration-300 shadow-md hover:shadow-lg "
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk Sekarang"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>

  );
}