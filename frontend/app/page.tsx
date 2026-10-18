'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Truck, CreditCard, Star, ShoppingBag, AlertCircle, ChevronRight, Folder } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock_quantity: number;
}

interface CategoryFolder {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

interface ParentBucket {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  children: CategoryFolder[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  avg_rating: number;
  total_sold: number;
  categories?: { name: string; slug: string };
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'newest'>('trending');
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [parentBuckets, setParentBuckets] = useState<ParentBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const [trendingRes, newestRes, catRes] = await Promise.all([
          fetchApi<{ success: boolean; data: Product[] }>('/products?sort=popular&limit=8'),
          fetchApi<{ success: boolean; data: Product[] }>('/products?sort=newest&limit=8'),
          fetchApi<{ success: boolean; data: ParentBucket[] }>('/categories')
        ]);

        if (trendingRes.success) setTrendingProducts(trendingRes.data || []);
        if (newestRes.success) setNewestProducts(newestRes.data || []);
        if (catRes.success) setParentBuckets(catRes.data || []);

      } catch (err) {
        console.error('Backend API error:', err);
        setErrorMsg('Không thể kết nối đến máy chủ Backend.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const currentProducts = activeTab === 'trending' ? trendingProducts : newestProducts;

  return (
    <div className="pb-24 pt-0">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-fashion-bg relative overflow-hidden px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* subtle texture overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,_rgba(200,80,120,0.25),_transparent)]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Text side */}
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-pink-100 backdrop-blur-sm sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 fill-pink-200 text-pink-200" />
              Bộ sưu tập thời trang nữ Premium
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
              Phong Cách Độc Bản
              <span className="mt-2 block font-black italic text-[#f5c4d2] underline decoration-[#f093ae] decoration-wavy underline-offset-8">
                Shofy Luxury Edition
              </span>
            </h1>

            <p className="mx-auto max-w-lg text-sm font-normal leading-relaxed text-pink-100 sm:text-base lg:mx-0">
              Khám phá hơn 448 thiết kế thời trang hiện đại được phân loại theo 7 Bucket chính — Áo, Quần, Giày, Mũ, Găng, Túi xách, Phụ kiện.
            </p>

            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row lg:justify-start">
              <Link
                href="/products"
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#8f2d45] shadow-lg transition-all hover:bg-[#fff7f9] sm:w-auto sm:text-base"
              >
                Khám phá Tất cả Sản phẩm
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/sale"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto sm:text-base"
              >
                Xem Khuyến Mãi
              </Link>
            </div>
          </div>

          {/* Image side */}
          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
              <img
                src="https://nnywafybvxthtylhntib.supabase.co/storage/v1/object/public/Ao/Ao_khoac/AoKhoac_1.jpg"
                alt="Shofy Luxury Fashion"
                className="aspect-[3/4] w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e0a16]/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          <div className="fashion-card flex items-start gap-4 rounded-2xl p-5">
            <div className="shrink-0 rounded-xl bg-[#fce4eb] p-3 text-[#c2536b]"><Truck className="h-6 w-6" /></div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1a1e] sm:text-base">Giao Hàng Toàn Quốc</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6972]">Đồng giá vận chuyển, hỗ trợ đồng kiểm</p>
            </div>
          </div>

          <div className="fashion-card flex items-start gap-4 rounded-2xl p-5">
            <div className="shrink-0 rounded-xl bg-[#f5ebfe] p-3 text-[#8b5cf6]"><CreditCard className="h-6 w-6" /></div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1a1e] sm:text-base">Thanh Toán Linh Hoạt</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6972]">Hỗ trợ COD & Cổng VNPay Sandbox</p>
            </div>
          </div>

          <div className="fashion-card flex items-start gap-4 rounded-2xl p-5">
            <div className="shrink-0 rounded-xl bg-[#fef3c7] p-3 text-[#d97706]"><Sparkles className="h-6 w-6" /></div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1a1e] sm:text-base">Tư Vấn Outfit AI</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6972]">Trợ lý phối đồ thông minh AI Stylist</p>
            </div>
          </div>

          <div className="fashion-card flex items-start gap-4 rounded-2xl p-5">
            <div className="shrink-0 rounded-xl bg-[#d1fae5] p-3 text-[#059669]"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1a1e] sm:text-base">Đổi Trả Dễ Dàng</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6972]">Đổi trả sản phẩm linh hoạt trong 7 ngày</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Buckets ───────────────────────────── */}
      <section className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c2536b]">Danh Mục Thời Trang</span>
            <h2 className="mt-1 text-2xl font-black text-[#1c1a1e] tracking-tight sm:text-3xl">7 Nhóm Danh Mục Chính</h2>
          </div>
          <Link href="/categories" className="flex items-center gap-1 text-sm font-semibold text-[#c2536b] hover:text-[#8f2d45] transition-colors">
            <span className="hidden sm:inline">Xem tất cả</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {parentBuckets.map((bucket) => (
            <div
              key={bucket.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#f0d4dc] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/products?category=${bucket.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#fdf6f8]">
                <img
                  src={bucket.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800'}
                  alt={bucket.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#1e0a16]/80 via-[#1e0a16]/20 to-transparent p-4 text-white">
                  <h3 className="text-xl font-black tracking-tight">{bucket.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#f5c4d2]">
                    {bucket.children?.length || 0} danh mục con
                  </p>
                </div>
              </Link>
              <div className="space-y-2.5 p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c2aab2]">
                  <Folder className="h-3.5 w-3.5 text-[#c2536b]" />
                  <span>Danh mục:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bucket.children?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/products?category=${sub.slug}`}
                      className="rounded-lg bg-[#fdf2f5] px-2.5 py-1 text-xs font-semibold text-[#7a6972] transition-colors hover:bg-[#c2536b] hover:text-white"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────── */}
      <section className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-[#f0d4dc] pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c2536b]">Sản Phẩm Nổi Bật</span>
            <h2 className="text-2xl font-black text-[#1c1a1e] tracking-tight sm:text-3xl">Khám Phá Trang Phục</h2>
          </div>
          <div className="flex self-center rounded-xl border border-[#f0d4dc] bg-[#fff7f9] p-1 md:self-auto">
            <button
              onClick={() => setActiveTab('trending')}
              className={`rounded-lg px-5 py-2 text-sm font-bold transition-all ${
                activeTab === 'trending'
                  ? 'bg-[#c2536b] text-white shadow-sm'
                  : 'text-[#7a6972] hover:text-[#1c1a1e]'
              }`}
            >
              🔥 Bán Chạy Nhất
            </button>
            <button
              onClick={() => setActiveTab('newest')}
              className={`rounded-lg px-5 py-2 text-sm font-bold transition-all ${
                activeTab === 'newest'
                  ? 'bg-[#c2536b] text-white shadow-sm'
                  : 'text-[#7a6972] hover:text-[#1c1a1e]'
              }`}
            >
              ✨ Hàng Mới Về
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse space-y-4 rounded-2xl border border-[#f0d4dc] bg-white p-4">
                <div className="aspect-[4/5] rounded-xl bg-[#fdf2f5]" />
                <div className="h-4 w-2/3 rounded bg-[#fdf2f5]" />
                <div className="h-3 w-1/3 rounded bg-[#fdf2f5]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {currentProducts.map((product) => {
              const primaryImg =
                product.product_images?.find((img) => img.is_primary)?.image_url ||
                product.product_images?.[0]?.image_url ||
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600';

              const formattedPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(product.base_price);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#f0d4dc] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#fdf6f8]">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.categories && (
                      <span className="absolute left-3 top-3 rounded-lg border border-[#f0d4dc] bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#3a2f34] shadow-sm backdrop-blur-sm">
                        {product.categories.name}
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {product.avg_rating}
                        <span className="font-normal text-[#b8abb2]">({product.total_sold} đã bán)</span>
                      </div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="line-clamp-2 text-sm font-bold leading-snug text-[#1c1a1e] transition-colors hover:text-[#c2536b] sm:text-base"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#f7eef1] pt-3">
                      <span className="text-base font-black text-[#c2536b] sm:text-lg">{formattedPrice}</span>
                      <Link
                        href={`/products/${product.slug}`}
                        className="rounded-xl bg-[#fce4eb] p-2.5 text-[#c2536b] shadow-sm transition-colors hover:bg-[#c2536b] hover:text-white"
                      >
                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#c2536b] px-8 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#8f2d45] hover:shadow-lg sm:text-base"
          >
            Xem Tất Cả 448 Sản Phẩm
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
