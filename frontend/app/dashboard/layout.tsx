import SideBar from "@/components/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />

      {/* TAMBAHKAN 'print:ml-0' AGAR MARGIN KIRI HILANG SAAT PRINT */}
      <main className="flex-1 ml-64 p-8 w-full print:ml-0 print:p-0">
        {children}
      </main>
    </div>
  );
}
