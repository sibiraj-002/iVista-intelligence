import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata = {
  title: "iVistaz Intelligence",
  description: "Enterprise growth intelligence dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
