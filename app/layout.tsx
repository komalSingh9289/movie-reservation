import { ClerkProvider } from "@clerk/nextjs";
import SyncUser from "@/components/SyncUser";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";
import Script from "next/script";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <Script
            src="https://sdk.cashfree.com/js/v3/cashfree.js"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

