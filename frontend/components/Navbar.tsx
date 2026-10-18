'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, LogOut, Shield, ChevronDown, Tag, Grid, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="glass-nav sticky top-0 z-50 transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
        <div className="flex h-[70px] items-center justify-between gap-2 sm:h-20">

          {/* Left: Logo + Nav */}
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-2">
              <span className="text-2xl font-black tracking-[-0.06em] text-[#1c1a1e] group-hover:text-[#c2536b] transition-colors duration-300 sm:text-3xl">
                SHOFY
              </span>
              <span className="rounded-lg bg-[#c2536b] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white shadow-sm sm:text-[11px]">
                Luxury
              </span>
            </Link>

            {/* Nav links */}
            <nav className="hidden items-center gap-5 text-sm font-semibold text-[#3a2f34] md:flex lg:gap-8 lg:text-base">
              <Link href="/" className="whitespace-nowrap py-2 hover:text-[#c2536b] transition-colors">
                Trang chủ
              </Link>
              <Link href="/products" className="flex items-center gap-1.5 whitespace-nowrap py-2 hover:text-[#c2536b] transition-colors">
                <Grid className="h-4 w-4 text-[#c2536b]" />
                <span>Sản phẩm & Danh mục</span>
              </Link>
              <Link href="/sale" className="flex items-center gap-1.5 whitespace-nowrap py-2 text-[#c2536b] hover:text-[#8f2d45] transition-colors">
                <Tag className="h-4 w-4" />
                <span>Khuyến mãi</span>
              </Link>
            </nav>
          </div>

          {/* Right: Search + Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Tìm kiếm thời trang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 rounded-full border border-[#f0d4dc] bg-[#fff7f9] py-2 pl-9 pr-4 text-sm transition-all placeholder:text-[#b8abb2] focus:w-64 focus:border-[#c2536b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fce4eb] xl:w-60 xl:focus:w-72"
              />
              <button type="submit" aria-label="Tìm kiếm" className="absolute left-3 top-2.5 text-[#c2ab b2] hover:text-[#c2536b] transition-colors">
                <Search className="h-4 w-4 text-[#c2aab2]" />
              </button>
            </form>

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label="Mở menu"
              className="inline-flex items-center justify-center rounded-full border border-[#f0d4dc] bg-white p-2 text-[#7a6972] hover:text-[#c2536b] transition-colors md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="rounded-full p-2 text-[#7a6972] transition-colors hover:bg-[#fce4eb] hover:text-[#c2536b]">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative rounded-full p-2 text-[#7a6972] transition-colors hover:bg-[#fce4eb] hover:text-[#c2536b]">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#c2536b] text-[10px] font-bold text-white shadow-sm">
                {getCartCount()}
              </span>
            </Link>

            {/* User */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#f0d4dc] bg-[#fdf2f5] py-1.5 pl-1.5 pr-3 text-sm font-semibold text-[#3a2f34] transition-colors hover:bg-[#fce4eb]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c2536b] to-[#8f2d45] text-xs font-bold text-white">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[90px] truncate">{user.full_name || user.email}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#b8abb2]" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 z-50 mt-2.5 w-56 rounded-2xl border border-[#f0d4dc] bg-white py-1.5 shadow-[0_12px_36px_rgba(142,45,69,0.14)]"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="border-b border-[#f7eef1] px-4 py-3">
                      <p className="truncate text-sm font-bold text-[#1c1a1e]">{user.full_name}</p>
                      <p className="truncate text-xs text-[#b8abb2]">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                          <Shield className="h-3.5 w-3.5" /> Quản trị viên
                        </span>
                      )}
                    </div>
                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3a2f34] transition-colors hover:bg-[#fff7f9] hover:text-[#c2536b]">
                      <User className="h-4 w-4 text-[#c2aab2]" />
                      Tài khoản cá nhân
                    </Link>
                    <Link href="/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3a2f34] transition-colors hover:bg-[#fff7f9] hover:text-[#c2536b]">
                      <ShoppingBag className="h-4 w-4 text-[#c2aab2]" />
                      Đơn hàng của tôi
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50">
                        <Shield className="h-4 w-4 text-purple-500" />
                        Trang Quản Trị
                      </Link>
                    )}
                    <div className="my-1 border-t border-[#f7eef1]" />
                    <button
                      onClick={() => { logout(); setIsDropdownOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4 text-rose-400" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="rounded-full border border-[#f0d4dc] px-4 py-2 text-sm font-semibold text-[#3a2f34] transition-colors hover:border-[#c2536b] hover:text-[#c2536b]"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#c2536b] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#8f2d45]"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
