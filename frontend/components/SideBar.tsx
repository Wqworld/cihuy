"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  ClipboardCheckIcon,
  LayoutDashboard,
  LucideLogOut,
  MenuSquareIcon,
  Timer,
  User2,
  UserCog2,
  Users2,
} from "lucide-react";

interface TokenPayLoad {
  id: number;
  role: string;
  nama: string;
  iat: number;
  exp: number;
}

export default function SideBar() {
  const path = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [userNama, setUserNama] = useState("");
  const [logoutPopup, setLogoutPopup] = useState(false);

  // Daftar Menu
  const listMenu = [
    {
      nama: "Dashboard",
      link: "/dashboard",
      icon: LayoutDashboard,
      role: ["ADMIN", "KASIR"],
    },
    {
      nama: "Produk",
      link: "/dashboard/produk", 
      icon: MenuSquareIcon,
      role: ["ADMIN", "KASIR"],
    },
    {
      nama: "Kategori",
      link: "/dashboard/kategori",
      icon: MenuSquareIcon,
      role: ["ADMIN", "KASIR"],
    },
    {
      nama: "Member",
      link: "/dashboard/member",
      icon: Users2,
      role: ["ADMIN", "KASIR"],
    },
    { 
      nama: "Kelola User", 
      link: "/dashboard/user", 
      icon: UserCog2, 
      role: ["ADMIN"] 
    },
    {
      nama: "Transaksi",
      link: "/dashboard/transaksi",
      icon: Timer,
      role: ["ADMIN", "KASIR"],
    },
    {
      nama: "Diskon",
      link: "/dashboard/diskon",
      icon: Banknote,
      role: ["ADMIN", "KASIR"],
    },
    {
      nama: "Laporan",
      link: "/dashboard/laporan",
      icon: ClipboardCheckIcon,
      role: ["ADMIN", "KASIR"],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    toast.success("Logout Berhasil");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Validasi Token Ketat
    if (!token || token === "undefined" || token === "null") {
      router.push("/login");
      return;
    }

    try {
      const decode = jwtDecode<TokenPayLoad>(token);
      // Paksa Uppercase biar cocok dengan listMenu
      setUserRole(decode.role ? decode.role.toUpperCase() : "");
      setUserNama(decode.nama || "User");
    } catch (error) {
      console.error("Token error:", error);
      localStorage.removeItem("token");
      router.push("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#F5F5F5] h-screen w-64 fixed left-0 top-0 border-r-4 border-[#68868C] flex flex-col px-4 py-6 z-50">
      
      {/* Header Logo */}
      <header className="flex flex-col justify-center items-center text-center mb-6">
        {/* Pastikan gambar ada di public/assets/mainLogo.png atau ganti src */}
        <div className="relative w-20 h-20">
             <Image
              src="/assets/mainLogo.png" 
              alt="logo"
              fill
              className="object-contain"
              priority
              onError={(e) => e.currentTarget.style.display = 'none'} // Sembunyikan kalau gambar 404
            />
        </div>
        <h1 className="text-3xl font-bold mt-2 text-[#68868C]">
          KasirKu
        </h1>
      </header>

      {/* Menu List */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {listMenu.map((item, index) => {
          // Filter Menu by Role
          if (!item.role.includes(userRole)) return null;

          const isActive = path === item.link;

          return (
            <Link
              key={index}
              href={item.link}
              className={`${
                isActive
                  ? "bg-[#68868C] text-white shadow-md"
                  : "bg-[#468284] text-white hover:bg-[#68868C] hover:scale-105"
              } flex items-center gap-3 p-3 rounded-xl transition-all font-medium border-2 border-[#404748]`}
            >
              <item.icon size={26} />
              <span>{item.nama}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer User & Logout */}
      <div className="mt-4 relative">
        {logoutPopup && (
          <button
            onClick={handleLogout}
            className="w-full mb-2 bg-[#468284] hover:bg-red-500 text-white flex items-center justify-center gap-2 p-2 rounded-xl transition-all border-2 border-[#404748] animate-in slide-in-from-bottom-2"
          >
            <LucideLogOut size={20} />
            <span className="text-lg">Logout</span>
          </button>
        )}
        
        <button
          onClick={() => setLogoutPopup(!logoutPopup)}
          className="w-full bg-[#468284] text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#68868C] transition-all border-2 border-[#404748]"
        >
          <User2 size={28} />
          <span className="text-lg truncate max-w-[120px]">{userNama}</span>
        </button>
      </div>
    </div>
  );
}