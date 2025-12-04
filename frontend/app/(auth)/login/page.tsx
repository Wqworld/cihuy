"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // Pastikan axios.ts baseURl port 5000
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Pakai sonner biar keren
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Tembak Backend
      const response = await api.post("/auth/login", {
        nama,      // Sesuaikan dengan backend (nama/username)
        password
      });

      // 2. AMBIL TOKEN (Anti-Jebakan)
      // Cek di dalam data.data.token ATAU data.token
      const token = response.data.data?.token || response.data.token;

      // 3. Validasi Keras
      if (!token) {
        throw new Error("Token tidak ditemukan dalam respon server");
      }

      // 4. Simpan & Redirect
      localStorage.setItem("token", token);
      toast.success("Login Berhasil! Mengalihkan...");
      
      // Kasih jeda dikit biar toast kebaca
      setTimeout(() => {
        router.replace("/dashboard");
      }, 500);

    } catch (error) {
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.message || "Gagal Login, periksa nama/password";
        console.error(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#68868C]">KasirKu</h1>
          <p className="text-gray-500">Silakan masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <Input 
              placeholder="Masukkan username..." 
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="h-12 border-2 focus:border-[#68868C]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input 
              type="password"
              placeholder="Masukkan password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-2 focus:border-[#68868C]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-[#468284] hover:bg-[#3a6d6f]"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}