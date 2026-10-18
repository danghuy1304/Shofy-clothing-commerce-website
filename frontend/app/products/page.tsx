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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header banner */}
      <div className="hero-fashion-bg relative overflow-hidden rounded-3xl p-8 text-white shadow-lg lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_-20%,_rgba(200,80,120,0.3),_transparent)]" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-pink-100 backdrop-blur-sm">
            Shofy Catalog 2026
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Bộ Sưu Tập Thời Trang
          </h1>
          <p className="text-sm font-medium text-pink-100 sm:text-base">
            Phân loại chuẩn 7 Bucket chính & Thư mục Folder con với 448 thiết kế sản phẩm đa dạng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="sticky top-28 space-y-6 rounded-2xl border border-[#f0d4dc] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f7eef1] pb-4">
              <div className="flex items-center gap-2 text-base font-bold text-[#1c1a1e]">
                <SlidersHorizontal className="h-5 w-5 text-[#c2536b]" />
                <span>Bộ Lọc Sản Phẩm</span>
              </div>
              {(selectedCategory || searchVal || minPrice || maxPrice) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7a6972]">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full rounded-xl border border-[#f0d4dc] bg-[#fff7f9] py-2 pl-9 pr-3 text-sm focus:border-[#c2536b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fce4eb]"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#c2aab2]" />
              </div>
            </div>

            {/* Category Filters */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7a6972]">7 Nhóm Bucket & Folders</label>

              <button
                onClick={() => setSelectedCategory('')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                  selectedCategory === ''
                    ? 'bg-[#c2536b] text-white shadow-sm'
                    : 'bg-[#fff7f9] text-[#3a2f34] hover:bg-[#fce4eb] hover:text-[#c2536b]'
                }`}
              >
                <span>Tất cả sản phẩm (448)</span>
                {selectedCategory === '' && <Check className="h-4 w-4" />}
              </button>

              <div className="custom-scrollbar max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {parentBuckets.map((bucket) => {
                  const isBucketActive = selectedCategory === bucket.slug;
                  const isOpen = openBuckets[bucket.slug] ?? true;
                  return (
                    <div key={bucket.id} className="overflow-hidden rounded-xl border border-[#f0d4dc]">
                      <div className="flex items-center justify-between bg-[#fff7f9] p-2 transition-colors hover:bg-[#fce4eb]">
                        <button
                          onClick={() => setSelectedCategory(bucket.slug)}
                          className={`flex flex-1 items-center gap-1.5 px-2 py-1 text-left text-sm font-extrabold transition-colors ${
                            isBucketActive ? 'text-[#c2536b]' : 'text-[#1c1a1e]'
                          }`}
                        >
                          <Folder className="h-4 w-4 shrink-0 text-[#c2536b]" />
                          <span className="truncate">{bucket.name}</span>
                          <span className="ml-1 rounded bg-[#fce4eb] px-1.5 py-0.5 text-[10px] font-bold text-[#c2536b]">
                            {bucket.children?.length}
                          </span>
                        </button>
                        <button onClick={() => toggleBucket(bucket.slug)} className="p-1 text-[#c2aab2] hover:text-[#c2536b]">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </div>
                      {isOpen && (
                        <div className="space-y-1 border-t border-[#f7eef1] bg-white p-2">
                          {bucket.children?.map((sub) => {
                            const isSubActive = selectedCategory === sub.slug;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => setSelectedCategory(sub.slug)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs font-semibold transition-all ${
                                  isSubActive
                                    ? 'bg-[#c2536b] font-bold text-white'
                                    : 'text-[#7a6972] hover:bg-[#fce4eb] hover:text-[#c2536b]'
                                }`}
                              >
                                <span className="truncate">{sub.name}</span>
                                {isSubActive && <Check className="h-3.5 w-3.5" />}
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
            <div className="space-y-3 border-t border-[#f7eef1] pt-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7a6972]">Khoảng Giá (VNĐ)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-[#f0d4dc] bg-[#fff7f9] px-3 py-2 text-xs focus:border-[#c2536b] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-[#f0d4dc] bg-[#fff7f9] px-3 py-2 text-xs focus:border-[#c2536b] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#f0d4dc] bg-white p-4 px-6 shadow-sm sm:flex-row">
            <p className="text-sm font-semibold text-[#3a2f34]">
              Hiển thị <span className="font-bold text-[#c2536b]">{products.length}</span> sản phẩm phù hợp
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#3a2f34]">
              <ArrowUpDown className="h-4 w-4 text-[#c2536b]" />
              <span>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-[#f0d4dc] bg-[#fff7f9] px-3 py-1.5 text-sm font-semibold focus:border-[#c2536b] focus:outline-none"
              >
                <option value="newest">Hàng mới về</option>
                <option value="popular">Bán chạy nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse space-y-4 rounded-2xl border border-[#f0d4dc] bg-white p-4">
                  <div className="aspect-[4/5] rounded-2xl bg-[#fdf2f5]" />
                  <div className="h-4 w-2/3 rounded bg-[#fdf2f5]" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="space-y-4 rounded-3xl border border-[#f0d4dc] bg-white p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fce4eb] text-[#c2536b]">
                <Filter className="h-8 w-8" />
              </div>
              <p className="text-xl font-bold text-[#1c1a1e]">Không tìm thấy sản phẩm phù hợp</p>
              <p className="mx-auto max-w-md text-sm text-[#7a6972]">
                Hãy thử chọn danh mục khác hoặc xóa bộ lọc để xem thêm kết quả.
              </p>
              <button
                onClick={handleResetFilters}
                className="rounded-full bg-[#c2536b] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#8f2d45]"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const primaryImg =
                  product.product_images?.find((img) => img.is_primary)?.image_url ||
                  product.product_images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600';

                const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price);
                const sizes = product.product_variants?.map((v) => v.attributes?.size).filter(Boolean) || [];

                return (
                  <div key={product.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[#f0d4dc] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
                        <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-amber-500">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {product.avg_rating}
                          </div>
                          <span className="font-normal text-[#b8abb2]">Đã bán {product.total_sold}</span>
                        </div>
                        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-bold leading-snug text-[#1c1a1e] transition-colors hover:text-[#c2536b]">
                          {product.name}
                        </Link>
                        {sizes.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <span className="text-[11px] font-semibold text-[#b8abb2]">Size:</span>
                            {sizes.slice(0, 5).map((sz, idx) => (
                              <span key={idx} className="rounded bg-[#fdf2f5] px-1.5 py-0.5 text-[10px] font-bold text-[#7a6972]">
                                {sz}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-[#f7eef1] pt-3">
                        <span className="text-base font-black text-[#c2536b] sm:text-lg">{formattedPrice}</span>
                        <Link href={`/products/${product.slug}`} className="rounded-xl bg-[#fce4eb] p-2.5 text-[#c2536b] shadow-sm transition-colors hover:bg-[#c2536b] hover:text-white">
                          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
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
    <Suspense fallback={<div className="p-12 text-center text-[#7a6972] font-semibold">Đang tải danh sách sản phẩm...</div>}>
      <ProductsListContent />
    </Suspense>
  );
}
