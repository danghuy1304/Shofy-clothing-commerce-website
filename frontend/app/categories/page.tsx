'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, FolderTree, Folder } from 'lucide-react';
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

export default function CategoriesPage() {
  const [parentBuckets, setParentBuckets] = useState<ParentBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetchApi<{ success: boolean; data: ParentBucket[] }>('/categories');
        if (res.success) {
          setParentBuckets(res.data || []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
          <FolderTree className="w-4 h-4" />
          <span>Cấu Trúc Danh Mục Chuẩn Storage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          7 Bucket Cha & Thư Mục Folder Con
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          Dữ liệu được phân loại theo đúng cấu trúc Storage Supabase: 7 Bucket lớn (Áo, Quần, Giày, Mũ, Găng, Túi xách, Phụ kiện) và 23 Thư mục Folder bên trong.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-semibold">Đang tải danh mục thời trang...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {parentBuckets.map((bucket) => (
            <div
              key={bucket.id}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Header Image & Title */}
              <Link href={`/products?category=${bucket.slug}`} className="block relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={bucket.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                  alt={bucket.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Bucket Name</span>
                  <h2 className="font-black text-3xl tracking-tight leading-none mt-0.5">{bucket.name}</h2>
                </div>
              </Link>

              {/* Subfolders Grid */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Folder className="w-4 h-4 text-emerald-600" />
                    <span>Các Folder Con Chi Tiết ({bucket.children?.length || 0}):</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {bucket.children?.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/products?category=${sub.slug}`}
                        className="px-3.5 py-2.5 bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-bold rounded-xl border border-slate-200/80 transition-all flex items-center justify-between group/sub truncate"
                        title={sub.name}
                      >
                        <span className="truncate">{sub.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-white flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/products?category=${bucket.slug}`}
                    className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                  >
                    <span>Xem tất cả sản phẩm thuộc {bucket.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
