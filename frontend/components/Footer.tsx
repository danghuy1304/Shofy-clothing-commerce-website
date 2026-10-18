import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headset } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#f0d4dc] bg-[#1e0a16] text-sm text-[#c8a0ae]">
      {/* Value strip */}
      <div className="border-b border-white/10 bg-[#2a0d1e]/60 py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="shrink-0 rounded-xl bg-[#fce4eb] p-3 text-[#c2536b]"><Truck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-white">Giao hàng miễn phí</p>
              <p className="mt-0.5 text-xs text-[#c8a0ae]">Cho đơn hàng từ 500.000đ</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="shrink-0 rounded-xl bg-[#fce4eb] p-3 text-[#c2536b]"><RotateCcw className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-white">Đổi trả trong 7 ngày</p>
              <p className="mt-0.5 text-xs text-[#c8a0ae]">Thủ tục nhanh chóng</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="shrink-0 rounded-xl bg-[#fce4eb] p-3 text-[#c2536b]"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-white">Cam kết chính hãng</p>
              <p className="mt-0.5 text-xs text-[#c8a0ae]">Chất lượng 100% bảo đảm</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="shrink-0 rounded-xl bg-[#fce4eb] p-3 text-[#c2536b]"><Headset className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-white">Hỗ trợ 24/7</p>
              <p className="mt-0.5 text-xs text-[#c8a0ae]">Tư vấn chọn size tận tâm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-block text-2xl font-black tracking-tight text-white">
              SHOFY <span className="text-[#e89ab4]">LUXURY</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-[#c8a0ae]">
              Thương hiệu thời trang ứng dụng cao cấp với hơn 30 danh mục sản phẩm từ Áo, Quần, Giày, Mũ đến Phụ kiện thời thượng.
            </p>
            <span className="inline-block rounded-full border border-[#e89ab4]/30 bg-[#3a1228] px-3 py-1 text-xs font-semibold text-[#f5c4d2]">
              ✨ Tư vấn AI Stylist tích hợp
            </span>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Khám Phá</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="transition-colors hover:text-[#f5c4d2]">Tất cả sản phẩm (448+)</Link></li>
              <li><Link href="/categories" className="transition-colors hover:text-[#f5c4d2]">30 Danh mục thời trang</Link></li>
              <li><Link href="/sale" className="transition-colors hover:text-[#f5c4d2]">Bộ sưu tập Sale</Link></li>
              <li><Link href="/ai-stylist" className="font-semibold text-[#e89ab4] transition-colors hover:text-[#f5c4d2]">Gợi ý trang phục AI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Hỗ Trợ</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="cursor-pointer transition-colors hover:text-[#f5c4d2]">Bảng quy chuẩn chọn Size</span></li>
              <li><span className="cursor-pointer transition-colors hover:text-[#f5c4d2]">Hướng dẫn mua hàng</span></li>
              <li><span className="cursor-pointer transition-colors hover:text-[#f5c4d2]">Chính sách bảo mật</span></li>
              <li><span className="cursor-pointer transition-colors hover:text-[#f5c4d2]">Quy định đổi trả</span></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Công Nghệ</h4>
            <p className="text-sm leading-relaxed text-[#c8a0ae]">
              Hệ thống E-Commerce Thời Trang Shofy kết hợp Tư vấn Phối đồ AI.
            </p>
            <p className="mt-3 text-xs text-[#9a7080]">
              Next.js · FastAPI · Supabase PostgreSQL & Storage
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-[#9a7080]">
          © {new Date().getFullYear()} Shofy Luxury Fashion — Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
