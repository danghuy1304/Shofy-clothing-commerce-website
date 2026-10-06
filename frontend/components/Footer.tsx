import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headset } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 text-sm border-t border-emerald-950 mt-24">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Giao hàng miễn phí</h4>
              <p className="text-xs text-slate-400">Cho đơn hàng từ 500k</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Đổi trả trong 7 ngày</h4>
              <p className="text-xs text-slate-400">Thủ tục nhanh chóng</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Cam kết chính hãng</h4>
              <p className="text-xs text-slate-400">Chất lượng 100% bảo đảm</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Hỗ trợ 24/7</h4>
              <p className="text-xs text-slate-400">Tư vấn chọn size tận tâm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="font-black text-2xl tracking-tight text-white inline-block mb-4">
              SHOFY <span className="text-emerald-400">LUXURY</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Thương hiệu thời trang ứng dụng cao cấp với hơn 30 danh mục sản phẩm từ Áo, Quần, Giày, Mũ đến Phụ kiện thời thượng.
            </p>
            <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-semibold">
              ✨ Tư vấn AI Stylist tích hợp
            </span>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">Khám Phá Danh Mục</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Tất cả sản phẩm (448+)</Link></li>
              <li><Link href="/categories" className="hover:text-emerald-400 transition-colors">30 Danh mục thời trang</Link></li>
              <li><Link href="/sale" className="hover:text-emerald-400 transition-colors">Bộ sưu tập Sale</Link></li>
              <li><Link href="/ai-stylist" className="hover:text-emerald-400 transition-colors text-emerald-400 font-semibold">Gợi ý trang phục AI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">Hướng Dẫn & Hỗ Trợ</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer">Bảng quy chuẩn chọn Size</span></li>
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer">Hướng dẫn mua hàng COD & VNPay</span></li>
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer">Chính sách bảo mật thông tin</span></li>
              <li><span className="hover:text-emerald-400 transition-colors cursor-pointer">Quy định đổi trả sản phẩm</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-base mb-4">Đồ Án Tốt Nghiệp</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hệ thống E-Commerce Thời Trang Cao Cấp Shofy kết hợp Tư vấn Phối đồ AI.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Công nghệ: Next.js (Frontend) + FastAPI (Backend) + Supabase PostgreSQL & Storage.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Shofy Luxury Fashion. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
