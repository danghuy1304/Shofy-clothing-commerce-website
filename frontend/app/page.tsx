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
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden green-gradient-bg text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-sm font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              <span>Bộ Sưu Tập 7 Nhóm Danh Mục Premium</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              Phong Cách Độc Bản <br />
              <span className="text-emerald-200 underline decoration-emerald-400 decoration-wavy underline-offset-8">
                Shofy Luxury Edition
              </span>
            </h1>

            <p className="text-emerald-50 text-base sm:text-lg max-w-2xl font-medium leading-relaxed">
              Khám phá hơn 448 thiết kế thời trang hiện đại được phân loại theo 7 Bucket chính (Áo, Quần, Giày, Mũ, Găng, Túi xách, Phụ kiện) với đầy đủ thư mục con.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>Khám phá Tất cả Sản phẩm</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md aspect-[4/5] rounded-3xl bg-emerald-800/30 border border-white/20 p-4 shadow-2xl backdrop-blur-sm relative group overflow-hidden">
              <img 
                src="https://nnywafybvxthtylhntib.supabase.co/storage/v1/object/public/Ao/Ao_khoac/AoKhoac_1.jpg" 
                alt="Shofy Luxury Hero"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Giao Hàng Toàn Quốc</h4>
              <p className="text-xs text-slate-500 mt-1">Đồng giá vận chuyển, hỗ trợ đồng kiểm</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-teal-50 text-teal-600">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Thanh Toán Linh Hoạt</h4>
              <p className="text-xs text-slate-500 mt-1">Hỗ trợ COD & Cổng VNPay Sandbox</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Tư Vấn Outfit AI</h4>
              <p className="text-xs text-slate-500 mt-1">Trợ lý phối đồ thông minh AI Stylist</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Đổi Trả Dễ Dàng</h4>
              <p className="text-xs text-slate-500 mt-1">Đổi trả sản phẩm linh hoạt trong 7 ngày</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Main Buckets Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Cấu Trúc Storage & Data</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">7 Nhóm Danh Mục Chính (Buckets)</h2>
          </div>
          <Link href="/categories" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Chi tiết tất cả thư mục</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {parentBuckets.map((bucket) => (
            <div
              key={bucket.id}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <Link href={`/products?category=${bucket.slug}`} className="block aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img
                  src={bucket.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                  alt={bucket.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="font-black text-2xl tracking-tight">{bucket.name}</h3>
                  <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                    {bucket.children?.length || 0} Thư mục Folder bên trong
                  </p>
                </div>
              </Link>

              {/* Subfolder Chips */}
              <div className="p-4 space-y-3 bg-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Folder className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Folders:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bucket.children?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/products?category=${sub.slug}`}
                      className="text-xs bg-slate-100 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg font-semibold text-slate-700 transition-colors"
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

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Sản Phẩm Nổi Bật</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Khám Phá Trang Phục</h2>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-xl self-center md:self-auto border border-slate-200">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'trending'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔥 Bán Chạy Nhất
            </button>
            <button
              onClick={() => setActiveTab('newest')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'newest'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ Hàng Mới Về
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold max-w-3xl mx-auto">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/50 p-4 space-y-4 animate-pulse">
                <div className="aspect-[4/5] bg-slate-100 rounded-2xl"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentProducts.map((product) => {
              const primaryImg = product.product_images?.find(img => img.is_primary)?.image_url 
                || product.product_images?.[0]?.image_url 
                || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';

              const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price);

              return (
                <div key={product.id} className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                  <Link href={`/products/${product.slug}`} className="cursor-pointer block relative aspect-[4/5] bg-slate-100 overflow-hidden">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.categories && (
                      <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-slate-800 shadow-sm border border-slate-200">
                        {product.categories.name}
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{product.avg_rating}</span>
                        <span className="text-slate-400 font-normal">({product.total_sold} đã bán)</span>
                      </div>

                      <Link href={`/products/${product.slug}`} className="font-bold text-slate-900 text-base line-clamp-2 hover:text-emerald-600 transition-colors leading-snug">
                        {product.name}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-lg font-black text-emerald-700">{formattedPrice}</span>
                      <Link href={`/products/${product.slug}`} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors shadow-sm">
                        <ShoppingBag className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center pt-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-emerald-600 hover:shadow-xl transition-all shadow-md"
          >
            <span>Xem Tất Cả 448 Sản Phẩm</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
