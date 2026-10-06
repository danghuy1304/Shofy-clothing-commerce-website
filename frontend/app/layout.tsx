import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AiStylistFloat from '@/components/AiStylistFloat';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Shofy Luxury Fashion - Website Thời Trang Cao Cấp',
  description: 'Khám phá hàng trăm thiết kế thời trang hiện đại từ Áo, Quần, Giày đến Phụ kiện kết hợp trợ lý tư vấn outfit AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-16rem)]">
              {children}
            </main>
            <Footer />
            <AiStylistFloat />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
