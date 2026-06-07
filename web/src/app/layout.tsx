import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar /> {/* Now it appears on every page */}
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
