'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, LogOut, Shield, ChevronDown, Tag, Grid } from 'lucide-react';
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
    <header className="sticky top-0 z-50 glass-nav border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo & Main Navigation */}
          <div className="flex items-center gap-10">
            {/* Super Prominent Logo */}
            <Link href="/" className="flex items-center gap-3 tracking-tight group">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                SHOFY
              </span>
              <span className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-extrabold tracking-widest shadow-md uppercase border border-emerald-500">
                LUXURY
              </span>
            </Link>

            {/* Navigation Links - Clean & No Line Wrapping */}
            <nav className="hidden md:flex items-center gap-8 text-base font-bold text-slate-800">
              <Link 
                href="/" 
                className="whitespace-nowrap hover:text-emerald-600 transition-colors py-2"
              >
                Trang chủ
              </Link>

              <Link 
                href="/products" 
                className="whitespace-nowrap hover:text-emerald-600 transition-colors flex items-center gap-2 py-2"
              >
                <Grid className="w-4 h-4 text-emerald-600" />
                <span>Sản phẩm & Danh mục</span>
              </Link>

              <Link 
                href="/sale" 
                className="whitespace-nowrap hover:text-rose-600 transition-colors flex items-center gap-1.5 text-rose-600 py-2"
              >
                <Tag className="w-4 h-4 text-rose-500 animate-bounce" />
                <span>Khuyến mãi</span>
              </Link>
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-5">
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-72">
              <input
                type="text"
                placeholder="Tìm kiếm thời trang, phụ kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100/90 border border-slate-200 rounded-full focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <button type="submit" className="absolute left-3.5 top-3 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">
                <Search className="w-4.5 h-4.5" />
              </button>
            </form>

            <Link href="/wishlist" className="p-2.5 text-slate-700 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors relative">
              <Heart className="w-6 h-6" />
            </Link>

            <Link href="/cart" className="p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute top-1 right-1 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {getCartCount()}
              </span>
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-2 text-sm font-bold text-slate-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-full transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{user.full_name || user.email}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-emerald-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full mt-1.5">
                          <Shield className="w-3.5 h-3.5" /> Quản trị viên
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Tài khoản cá nhân</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      <span>Đơn hàng của tôi</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span>Trang Quản Trị (Admin)</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1.5"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors whitespace-nowrap"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg rounded-full transition-all whitespace-nowrap"
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
