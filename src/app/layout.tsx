import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import LayoutContent from "@/components/LayoutContent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <AuthGuard>
          <LayoutContent>{children}</LayoutContent>
        </AuthGuard>
      </body>
    </html>
  );
}