'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingBag, Star, Truck, Check, Heart, RotateCcw, Plus, Minus,
  ChevronRight, Shield, CreditCard, Ruler, X, Send, User, ChevronLeft,
  Flame, Package, ZoomIn
} from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';

/* ─── Types ───────────────────────────────────────────────── */

interface ProductVariant {
  id: string;
  sku: string;
  attributes: { size?: string; [key: string]: any };
  price: number;
  stock_quantity: number;
}

interface ProductImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  avg_rating: number;
  total_sold: number;
  created_at?: string;
  categories?: { id: string; name: string; slug: string };
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: { full_name?: string; email?: string };
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  avg_rating: number;
  total_sold: number;
  product_images?: { image_url: string; is_primary: boolean }[];
}

/* ─── Size Guide Data ─────────────────────────────────────── */

const SIZE_GUIDES: Record<string, { headers: string[]; rows: string[][] }> = {
  'ao': {
    headers: ['Size', 'Chiều dài (cm)', 'Vòng ngực (cm)', 'Vai (cm)', 'Cân nặng (kg)'],
    rows: [
      ['S', '65', '86–90', '40', '50–58'],
      ['M', '68', '90–94', '42', '58–65'],
      ['L', '71', '94–98', '44', '65–72'],
      ['XL', '74', '98–102', '46', '72–80'],
      ['XXL', '77', '102–108', '48', '80–90'],
    ]
  },
  'quan': {
    headers: ['Size', 'Chiều dài (cm)', 'Vòng eo (cm)', 'Vòng hông (cm)', 'Cân nặng (kg)'],
    rows: [
      ['S', '96', '68–72', '88–92', '50–58'],
      ['M', '98', '72–76', '92–96', '58–65'],
      ['L', '100', '76–80', '96–100', '65–72'],
      ['XL', '102', '80–86', '100–106', '72–80'],
      ['XXL', '104', '86–92', '106–112', '80–90'],
    ]
  },
  'giay': {
    headers: ['Size', 'Chiều dài chân (cm)', 'US', 'UK'],
    rows: [
      ['38', '24.0', '6', '5.5'],
      ['39', '24.5', '6.5', '6'],
      ['40', '25.5', '7.5', '7'],
      ['41', '26.0', '8', '7.5'],
      ['42', '27.0', '9', '8.5'],
      ['43', '27.5', '9.5', '9'],
    ]
  },
  'default': {
    headers: ['Size', 'Ghi chú'],
    rows: [
      ['Freesize', 'Phù hợp cho hầu hết mọi người (45–80 kg)'],
    ]
  }
};

function getSizeGuideKey(categorySlug?: string): string {
  if (!categorySlug) return 'default';
  if (categorySlug.startsWith('ao') || categorySlug === 'ao') return 'ao';
  if (categorySlug.startsWith('quan') || categorySlug === 'quan') return 'quan';
  if (categorySlug.startsWith('giay') || categorySlug === 'giay') return 'giay';
  return 'default';
}

/* ─── Format helpers ──────────────────────────────────────── */

function formatVND(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getImageUrl(product: RelatedProduct | Product): string {
  const imgs = product.product_images;
  if (!imgs || imgs.length === 0) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400';
  const primary = imgs.find(i => i.is_primary);
  return primary?.image_url || imgs[0]?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400';
}

/* ─── Star Rating Component ───────────────────────────────── */

function StarRating({ rating, size = 16, interactive = false, onChange }: {
  rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            size={size}
            className={`${
              star <= (hover || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  /* ─── State ─────────────────────────────────────────────── */
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('Freesize');
  const [quantity, setQuantity] = useState(1);
  const [successToast, setSuccessToast] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Zoom
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'description' | 'policy' | 'reviews'>('description');

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  // Size Guide modal
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  /* ─── Load product ──────────────────────────────────────── */
  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await fetchApi<{ success: boolean; data: Product }>(`/products/${slug}`);
        if (res.success && res.data) {
          const prod = res.data;
          setProduct(prod);

          const primary = prod.product_images?.find(img => img.is_primary)?.image_url
            || prod.product_images?.[0]?.image_url
            || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
          setActiveImage(primary);

          const variants = prod.product_variants || [];
          if (variants.length > 0 && variants[0].attributes?.size) {
            setSelectedSize(variants[0].attributes.size);
          }
        } else {
          setErrorMsg('Sản phẩm không tồn tại hoặc đã bị xóa.');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setErrorMsg('Không thể kết nối đến máy chủ.');
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  /* ─── Load reviews ──────────────────────────────────────── */
  const loadReviews = useCallback(async (productId: string) => {
    setReviewsLoading(true);
    try {
      const res = await fetchApi<{ success: boolean; data: Review[] }>(`/reviews/product/${productId}`);
      if (res.success) setReviews(res.data || []);
    } catch { /* ignore */ }
    finally { setReviewsLoading(false); }
  }, []);

  useEffect(() => {
    if (product?.id) {
      loadReviews(product.id);
    }
  }, [product?.id, loadReviews]);

  /* ─── Load related products ─────────────────────────────── */
  useEffect(() => {
    async function loadRelated() {
      if (!product?.id) return;
      try {
        const res = await fetchApi<{ success: boolean; data: RelatedProduct[] }>(`/products/${product.id}/related?limit=8`);
        if (res.success) setRelatedProducts(res.data || []);
      } catch { /* ignore */ }
    }
    loadRelated();
  }, [product?.id]);

  /* ─── Zoom handler ──────────────────────────────────────── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  /* ─── Computed values ───────────────────────────────────── */
  const variants = product?.product_variants || [];
  const rawSizes = variants.map(v => v.attributes?.size).filter((sz): sz is string => Boolean(sz));
  const availableSizes = Array.from(new Set(rawSizes));
  const sizeList = availableSizes.length > 0 ? availableSizes : ['Freesize'];
  const selectedVariant = variants.find(v => v.attributes?.size === selectedSize) || variants[0];
  const currentStock = selectedVariant?.stock_quantity ?? 50;
  const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);

  // Review stats
  const totalReviews = reviews.length;
  const avgReviewRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : product?.avg_rating || 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0
  }));

  /* ─── Add to cart ───────────────────────────────────────── */
  const handleAddToCart = () => {
    if (!product) return;
    if (currentStock <= 0) return;

    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id || product.id,
      name: product.name,
      image: activeImage,
      size: selectedSize || 'Freesize',
      color: 'Mặc định',
      price: product.base_price,
      stockQuantity: currentStock
    }, quantity);

    setSuccessToast(`Đã thêm ${quantity} x "${product.name}" (Size: ${selectedSize}) vào giỏ hàng!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  /* ─── Submit review ─────────────────────────────────────── */
  const handleSubmitReview = async () => {
    if (!product) return;
    setSubmittingReview(true);
    setReviewMsg('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('shofy_token') : null;
      if (!token) {
        setReviewMsg('Vui lòng đăng nhập để gửi đánh giá.');
        return;
      }
      await fetchApi('/reviews', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          product_id: product.id,
          rating: newRating,
          comment: newComment
        })
      });
      setReviewMsg('Cảm ơn bạn đã gửi đánh giá! ✨');
      setNewComment('');
      setNewRating(5);
      loadReviews(product.id);
    } catch (err: any) {
      setReviewMsg(err.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ─── Loading state ─────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-base font-semibold text-slate-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-base font-semibold">
          {errorMsg || 'Không tìm thấy sản phẩm.'}
        </div>
        <button onClick={() => router.push('/products')} className="px-6 py-3 bg-emerald-600 text-white font-bold text-base rounded-full shadow-md hover:bg-emerald-700">
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  const sizeGuideKey = getSizeGuideKey(product.categories?.slug);
  const sizeGuide = SIZE_GUIDES[sizeGuideKey] || SIZE_GUIDES['default'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* ── Toast ─────────────────────────────────────────── */}
      {successToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm border border-emerald-500 animate-in fade-in slide-in-from-top-4">
          <Check className="w-5 h-5 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Breadcrumb ────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-emerald-600 transition-colors">Sản phẩm</Link>
        {product.categories && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/products?category=${product.categories.slug}`} className="hover:text-emerald-600 transition-colors">
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          MAIN PRODUCT SECTION
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

        {/* ── LEFT: Image Gallery ─────────────────────────── */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Image with Zoom */}
          <div
            ref={imageContainerRef}
            className="aspect-[4/5] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm relative group cursor-zoom-in"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={isZooming ? {
                transform: 'scale(2)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              } : undefined}
            />
            {/* Category badge */}
            {product.categories && (
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 border border-slate-200 shadow-sm pointer-events-none">
                {product.categories.name}
              </span>
            )}
            {/* HOT badge */}
            {product.total_sold > 30 && (
              <span className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 pointer-events-none shadow-md">
                <Flame className="w-3.5 h-3.5" /> HOT
              </span>
            )}
            {/* Zoom hint */}
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" /> Di chuột để phóng to
            </div>
          </div>

          {/* Thumbnails */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {product.product_images
                .sort((a, b) => a.display_order - b.display_order)
                .map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img.image_url
                      ? 'border-emerald-600 ring-2 ring-emerald-200 shadow-md'
                      : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product Info ─────────────────────────── */}
        <div className="lg:col-span-6 space-y-6">

          {/* Rating + Sold */}
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating rating={Math.round(product.avg_rating)} size={18} />
            <span className="text-base font-bold text-amber-600">{product.avg_rating}</span>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-500 font-medium">{totalReviews} đánh giá</span>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-500 font-medium">{product.total_sold} đã bán</span>
          </div>

          {/* Product name */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-black text-emerald-700">{formatVND(product.base_price)}</span>
            {totalStock > 0 ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
                ✓ Còn hàng
              </span>
            ) : (
              <span className="text-xs bg-rose-50 text-rose-600 font-bold px-3 py-1 rounded-full border border-rose-200">
                Hết hàng
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-slate-600 text-base leading-relaxed border-t border-b border-slate-100 py-4">
            {product.description?.substring(0, 200)}
            {product.description && product.description.length > 200 ? '...' : ''}
          </p>

          {/* ── Size Selector ─────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Chọn kích cỡ:
              </label>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors"
              >
                <Ruler className="w-4 h-4" />
                Hướng dẫn chọn Size
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {sizeList.map((sz) => {
                const variant = variants.find(v => v.attributes?.size === sz);
                const stock = variant?.stock_quantity ?? 0;
                const isOutOfStock = stock <= 0 && variants.length > 0;
                const isSelected = selectedSize === sz;

                return (
                  <button
                    key={sz}
                    onClick={() => {
                      if (!isOutOfStock) {
                        setSelectedSize(sz);
                        setQuantity(1);
                      }
                    }}
                    disabled={isOutOfStock}
                    className={`min-w-[64px] h-14 px-4 rounded-xl font-bold text-sm border-2 transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                      isOutOfStock
                        ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                        : isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="text-sm">{sz}</span>
                    {variants.length > 0 && (
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-100' : isOutOfStock ? 'text-slate-300' : 'text-slate-400'}`}>
                        {isOutOfStock ? 'Hết' : `Còn ${stock}`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Quantity Selector ──────────────────────────── */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Số lượng:
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center font-black text-slate-900 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-slate-400 font-medium">
                Kho: còn <span className={`font-bold ${currentStock <= 5 ? 'text-orange-500' : 'text-emerald-600'}`}>{currentStock}</span> sản phẩm
              </span>
            </div>
          </div>

          {/* ── Action buttons ────────────────────────────── */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className={`flex-1 py-4 px-8 rounded-full font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 ${
                currentStock > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20 hover:shadow-xl'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{currentStock > 0 ? 'Thêm Vào Giỏ Hàng' : 'Tạm Hết Hàng'}</span>
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-4 rounded-full border-2 transition-all ${
                isWishlisted ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* ── Policy badges ─────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Miễn phí ship</p>
                <p className="text-xs text-slate-400">Đơn từ 500.000đ</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Đổi trả 7 ngày</p>
                <p className="text-xs text-slate-400">Nếu lỗi sản xuất</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Hàng chính hãng</p>
                <p className="text-xs text-slate-400">Cam kết 100%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Thanh toán an toàn</p>
                <p className="text-xs text-slate-400">COD, VNPay, Ví điện tử</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TABS SECTION
          ═══════════════════════════════════════════════════════ */}
      <div className="border-t border-slate-200 pt-10">
        {/* Tab headers */}
        <div className="flex gap-1 border-b border-slate-200">
          {([
            { key: 'description' as const, label: 'Mô tả chi tiết' },
            { key: 'policy' as const, label: 'Chính sách & Bảo hành' },
            { key: 'reviews' as const, label: `Đánh giá (${totalReviews})` },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3.5 text-sm font-bold transition-all border-b-2 -mb-[1px] ${
                activeTab === tab.key
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-8">
          {/* ── Tab: Mô tả ────────────────────────────────── */}
          {activeTab === 'description' && (
            <div className="max-w-4xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Thông tin sản phẩm</h3>
              <div className="prose prose-slate max-w-none text-base leading-relaxed text-slate-600">
                {product.description?.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3">{paragraph}</p>
                )) || <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>}
              </div>

              {/* Product meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-6 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-28">Danh mục:</span>
                  <span className="text-sm font-semibold text-slate-800">{product.categories?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-28">Mã sản phẩm:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedVariant?.sku || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-28">Kích cỡ có sẵn:</span>
                  <span className="text-sm font-semibold text-slate-800">{sizeList.join(', ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-28">Tình trạng:</span>
                  <span className={`text-sm font-bold ${totalStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {totalStock > 0 ? `Còn hàng (${totalStock} SP)` : 'Hết hàng'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Chính sách ───────────────────────────── */}
          {activeTab === 'policy' && (
            <div className="max-w-4xl space-y-8">
              {/* Shipping */}
              <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-6 h-6 text-emerald-600" />
                  <h4 className="text-lg font-bold text-slate-900">Chính sách giao hàng</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 ml-9 list-disc">
                  <li><span className="font-semibold text-emerald-700">Miễn phí vận chuyển</span> cho đơn hàng từ 500.000đ trở lên</li>
                  <li>Giao hàng nhanh 2–4 ngày cho khu vực nội thành TP.HCM và Hà Nội</li>
                  <li>Giao hàng tiêu chuẩn 3–7 ngày cho các tỉnh thành khác</li>
                  <li>Phí vận chuyển 30.000đ cho đơn hàng dưới 500.000đ</li>
                </ul>
              </div>

              {/* Return */}
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <RotateCcw className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-bold text-slate-900">Chính sách đổi trả</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 ml-9 list-disc">
                  <li><span className="font-semibold text-blue-700">Đổi trả miễn phí trong 7 ngày</span> nếu sản phẩm lỗi do nhà sản xuất</li>
                  <li>Hỗ trợ đổi size miễn phí 1 lần nếu chọn sai kích cỡ</li>
                  <li>Sản phẩm đổi trả phải còn nguyên tem mác, chưa qua sử dụng</li>
                  <li>Liên hệ hotline <span className="font-bold text-slate-800">1900 xxxx</span> để được hỗ trợ</li>
                </ul>
              </div>

              {/* Payment */}
              <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  <h4 className="text-lg font-bold text-slate-900">Phương thức thanh toán</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 ml-9 list-disc">
                  <li><span className="font-semibold">Thanh toán khi nhận hàng (COD)</span> — Trả tiền mặt khi nhận được sản phẩm</li>
                  <li><span className="font-semibold">VNPay</span> — Chuyển khoản online qua cổng thanh toán VNPay</li>
                  <li><span className="font-semibold">Ví điện tử</span> — MoMo, ZaloPay, ShopeePay</li>
                </ul>
              </div>

              {/* Warranty */}
              <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-amber-600" />
                  <h4 className="text-lg font-bold text-slate-900">Bảo hành & Cam kết</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 ml-9 list-disc">
                  <li><span className="font-semibold text-amber-700">Bảo hành 30 ngày</span> cho các lỗi đường may, chất liệu</li>
                  <li>100% hàng chính hãng — Cam kết hoàn tiền gấp 2 nếu phát hiện hàng giả</li>
                  <li>Tất cả sản phẩm đều được kiểm tra chất lượng trước khi giao</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Tab: Đánh giá ─────────────────────────────── */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl space-y-8">
              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row gap-8 p-6 bg-slate-50 rounded-2xl">
                {/* Left: Big rating number */}
                <div className="flex flex-col items-center justify-center min-w-[140px]">
                  <span className="text-5xl font-black text-slate-900">{avgReviewRating}</span>
                  <StarRating rating={Math.round(avgReviewRating)} size={20} />
                  <span className="text-sm text-slate-500 mt-1 font-medium">{totalReviews} đánh giá</span>
                </div>

                {/* Right: Breakdown bars */}
                <div className="flex-1 space-y-2">
                  {ratingBreakdown.map(({ star, count, percent }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-600 w-8 text-right">{star} ★</span>
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium w-16">{count} ({percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {review.profiles?.full_name || review.profiles?.email?.split('@')[0] || 'Khách hàng'}
                            </p>
                            <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-600 leading-relaxed ml-[52px]">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-base font-semibold">Chưa có đánh giá nào</p>
                  <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                </div>
              )}

              {/* Submit Review Form */}
              <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-4">
                <h4 className="text-lg font-bold text-slate-900">Viết đánh giá của bạn</h4>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-600">Chất lượng:</span>
                  <StarRating rating={newRating} size={24} interactive onChange={setNewRating} />
                  <span className="text-sm font-bold text-amber-600">({newRating}/5)</span>
                </div>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                />
                {reviewMsg && (
                  <p className={`text-sm font-semibold ${reviewMsg.includes('Cảm ơn') ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {reviewMsg}
                  </p>
                )}
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RELATED PRODUCTS
          ═══════════════════════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Sản phẩm liên quan</h2>
            {product.categories && (
              <Link
                href={`/products?category=${product.categories.slug}`}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.slice(0, 8).map(rp => (
              <Link
                key={rp.id}
                href={`/products/${rp.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
              >
                <div className="aspect-square bg-slate-50 overflow-hidden">
                  <img
                    src={getImageUrl(rp)}
                    alt={rp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                    {rp.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-500">{rp.avg_rating}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400">{rp.total_sold} đã bán</span>
                  </div>
                  <p className="text-base font-black text-emerald-700">{formatVND(rp.base_price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SIZE GUIDE MODAL
          ═══════════════════════════════════════════════════════ */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900">Hướng dẫn chọn Size</h3>
                <p className="text-sm text-slate-500 mt-0.5">Danh mục: {product.categories?.name || 'Chung'}</p>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-50">
                      {sizeGuide.headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left font-bold text-emerald-800 border-b border-emerald-100 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGuide.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={`${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-emerald-50/50 transition-colors`}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`px-4 py-3 border-b border-slate-100 whitespace-nowrap ${cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
                <p className="font-bold mb-1">💡 Mẹo chọn size:</p>
                <p>Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn để mặc thoải mái hơn. Bạn cũng có thể đổi size miễn phí 1 lần.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
