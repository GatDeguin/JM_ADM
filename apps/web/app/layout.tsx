import "./globals.css";
import { ToastProvider } from "@/components/ui/Toasts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-zinc-900 focus:px-3 focus:py-2 focus:text-white">
          Saltar al contenido principal
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
