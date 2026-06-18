import Navbar from '@/components/layout/Navbar';

export default function BusinessesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
