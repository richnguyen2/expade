import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Navigation spans the whole width */}
      <Navbar />
      
      {/* Bottom section splits between Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}