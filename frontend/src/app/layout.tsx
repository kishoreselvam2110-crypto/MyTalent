import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyTalent - PM Internship Scheme",
  description: "Smart choices for bright futures",
  manifest: "/manifest.json",
  themeColor: "#FF9933",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyTalent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Top Bar Navigation */}
          <nav className="w-full h-16 border-b flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
                🇮🇳 MyTalent
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline-block text-muted-foreground mr-2">भारत</span>
              {/* Theme toggle could go here */}
            </div>
          </nav>

          <main className="flex-1 flex flex-col">
            {children}
          </main>
          
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
