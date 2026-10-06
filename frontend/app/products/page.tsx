'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, Star, Filter, Search, RotateCcw, SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronRight, Check, Folder } from 'lucide-react';
import { fetchApi } from '@/lib/api';

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

interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock_quantity: number;
}

interface ProductImage {
  image_url: string;
  is_primary: boolean;
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

function ProductsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [parentBuckets, setParentBuckets] = useState<ParentBucket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [openBuckets, setOpenBuckets] = useState<Record<string, boolean>>({
    'ao': true, 'quan': true, 'giay': true
  });

  // Fetch Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetchApi<{ success: boolean; data: ParentBucket[] }>('/categories');
        if (res.success) {
          setParentBuckets(res.data || []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products with filters
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category_slug', selectedCategory);
        if (searchVal) params.append('search', searchVal);
        if (minPrice) params.append('min_price', minPrice);
        if (maxPrice) params.append('max_price', maxPrice);
        if (sortBy) params.append('sort', sortBy);
        params.append('limit', '40');

        const res = await fetchApi<{ success: boolean; data: Product[] }>(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, searchVal, minPrice, maxPrice, sortBy]);

  const toggleBucket = (slug: string) => {
    setOpenBuckets(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchVal('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-lg green-gradient-bg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Shofy Catalog 2026
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Bộ Sưu Tập Thời Trang
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base font-medium">
            Phân loại chuẩn 7 Bucket chính & Thư mục Folder con với 448 thiết kế sản phẩm đa dạng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-sm sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                <span>Bộ Lọc Sản Phẩm</span>
              </div>

              {(selectedCategory || searchVal || minPrice || maxPrice) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* 7 Bucket Accordion Filters */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">7 Nhóm Bucket & Folders</label>
              
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                  selectedCategory === ''
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-800 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span>Tất cả sản phẩm (448)</span>
                {selectedCategory === '' && <Check className="w-4 h-4" />}
              </button>

              <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {parentBuckets.map((bucket) => {
                  const isBucketActive = selectedCategory === bucket.slug;
                  const isOpen = openBuckets[bucket.slug] ?? true;

                  return (
                    <div key={bucket.id} className="border border-slate-200/80 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <button
                          onClick={() => setSelectedCategory(bucket.slug)}
                          className={`flex-1 text-left px-2 py-1 text-sm font-extrabold flex items-center gap-1.5 transition-colors ${
                            isBucketActive ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          <Folder className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{bucket.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold ml-1">
                            {bucket.children?.length}
                          </span>
                        </button>

                        <button
                          onClick={() => toggleBucket(bucket.slug)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                          {bucket.children?.map((sub) => {
                            const isSubActive = selectedCategory === sub.slug;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => setSelectedCategory(sub.slug)}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                                  isSubActive
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                <span className="truncate">{sub.name}</span>
                                {isSubActive && <Check className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Khoảng Giá (VNĐ)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              Hiển thị <span className="font-bold text-emerald-700">{products.length}</span> sản phẩm phù hợp
            </p>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ArrowUpDown className="w-4 h-4 text-emerald-600" />
              <span>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="newest">Hàng mới về</option>
                <option value="popular">Bán chạy nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/50 p-4 space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-slate-100 rounded-2xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Hãy thử chọn danh mục khác hoặc xóa bộ lọc để xem thêm kết quả.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-emerald-700 transition-all"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const primaryImg = product.product_images?.find(img => img.is_primary)?.image_url 
                  || product.product_images?.[0]?.image_url 
                  || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';

                const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price);
                const sizes = product.product_variants?.map(v => v.attributes?.size).filter(Boolean) || [];

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

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-amber-500 mb-1.5">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{product.avg_rating}</span>
                          </div>
                          <span className="text-slate-400 font-normal">Đã bán {product.total_sold}</span>
                        </div>

                        <Link href={`/products/${product.slug}`} className="font-bold text-slate-900 text-base line-clamp-2 hover:text-emerald-600 transition-colors leading-snug">
                          {product.name}
                        </Link>

                        {sizes.length > 0 && (
                          <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-slate-400">Size:</span>
                            {sizes.slice(0, 5).map((sz, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                {sz}
                              </span>
                            ))}
                          </div>
                        )}
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
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Đang tải danh sách sản phẩm...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}
