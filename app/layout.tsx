import { ClerkProvider } from "@clerk/nextjs";
import SyncUser from "@/components/SyncUser";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SyncUser />
          <LayoutWrapper>{children}</LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}

