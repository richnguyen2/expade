import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Providers>
            <main>{children}</main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}