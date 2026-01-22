import { ClerkProvider } from "@clerk/nextjs";
import SyncUser from "@/components/SyncUser";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";
import Script from "next/script";

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
          <Script
            src="https://sdk.cashfree.com/js/v3/cashfree.js"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

