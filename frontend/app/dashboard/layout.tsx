import SideBar from "@/components/SideBar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <SideBar />

      {/* Konten Utama */}
      <main className="flex-1 ml-64 p-8 w-full">
        {children}
      </main>
    </div>
  );
}