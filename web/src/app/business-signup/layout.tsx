import Navbar from '@/components/layout/Navbar';

export default function BusinessSignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">{children}</main>
    </div>
  );
}
