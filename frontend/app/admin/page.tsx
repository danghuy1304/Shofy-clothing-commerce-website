'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, ShoppingBag, FolderTree, Receipt, Percent, Plus, Trash2, Edit3, 
  RefreshCw, TrendingUp, User, Search, Filter, Shield, AlertCircle, Check, X, Box, Tag, ArrowRight, Phone, MapPin, Award, CheckCircle2, Clock, Truck, XCircle, DollarSign
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';

interface Stats {
  revenue: number;
  total_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  pending_orders: number;
  shipping_orders: number;
  confirmed_orders: number;
  avg_order_value: number;
  total_products: number;
  total_users: number;
}

interface CategoryStat {
  category: string;
  count: number;
  sales: number;
  revenue: number;
  percentage: number;
}

const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  
  // Navigation tabs: 'dashboard' | 'products' | 'categories' | 'orders' | 'coupons'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'coupons'>('dashboard');

  // Loading & Notice states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Enhanced Statistics States
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

  // 2. Products State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategoryId, setPCategoryId] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');

  // Search & Filters
  const [pSearch, setPSearch] = useState('');
  const [pCatFilter, setPCatFilter] = useState('');

  // Variant Modal
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<any | null>(null);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [vSize, setVSize] = useState('S');
  const [vStock, setVStock] = useState('50');

  // Delete Modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // 3. Orders State
  const [orders, setOrders] = useState<any[]>([]);

  // 4. Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState('percent');
  const [cpVal, setCpVal] = useState('');

  // Check admin role
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // Load Admin Data & Analytics
  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Stats & Analytics
      const statsRes = await fetchApi<{ 
        success: boolean; 
        stats: Stats; 
        recent_orders: any[]; 
        top_selling: any[]; 
        category_stats: CategoryStat[] 
      }>('/admin/stats', { headers });

      if (statsRes.success) {
        setStats(statsRes.stats);
        setRecentOrders(statsRes.recent_orders || []);
        setTopSelling(statsRes.top_selling || []);
        setCategoryStats(statsRes.category_stats || []);
      }

      // Products
      const prodRes = await fetchApi<{ success: boolean; data: any[] }>('/admin/products', { headers });
      if (prodRes.success) setProducts(prodRes.data || []);

      // Categories
      const catRes = await fetchApi<{ success: boolean; data: any[] }>('/categories');
      if (catRes.success) setCategories(catRes.data || []);

      // Orders
      const orderRes = await fetchApi<{ success: boolean; data: any[] }>('/admin/orders', { headers });
      if (orderRes.success) setOrders(orderRes.data || []);

      // Coupons
      const cpnRes = await fetchApi<{ success: boolean; data: any[] }>('/admin/coupons', { headers });
      if (cpnRes.success) setCoupons(cpnRes.data || []);

    } catch (err: any) {
      console.error('Error loading admin analytics:', err);
      setErrorMsg(err.message || 'Lỗi tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAdminData();
  }, [token]);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pPrice || !pCategoryId) {
      alert('Vui lòng điền đầy đủ tên, giá và danh mục sản phẩm!');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const slugValue = pSlug.trim() || toSlug(pName.trim());
      const payload = {
        name: pName.trim(),
        slug: slugValue,
        description: pDescription.trim(),
        base_price: floatValue(pPrice),
        category_id: pCategoryId,
        status: 'active',
        image_url: pImageUrl.trim() || undefined
      };

      let res;
      if (pId) {
        res = await fetchApi<{ success: boolean; message: string }>(`/admin/products/${pId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchApi<{ success: boolean; message: string }>(`/admin/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.success) {
        showToast(pId ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm mới thành công!');
        setShowProductForm(false);
        resetProductForm();
        loadAdminData();
      }
    } catch (err: any) {
      alert('Lỗi lưu sản phẩm: ' + err.message);
    }
  };

  const handleEditProduct = (prod: any) => {
    setPId(prod.id);
    setPName(prod.name);
    setPSlug(prod.slug);
    setPDescription(prod.description || '');
    setPPrice(String(prod.base_price));
    setPCategoryId(prod.category_id);
    setPImageUrl(prod.product_images?.[0]?.image_url || '');
    setShowProductForm(true);
  };

  const handleDeleteProductConfirm = async () => {
    if (!deleteId) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await fetchApi(`/admin/products/${deleteId}`, { method: 'DELETE', headers });
      showToast('Đã xóa sản phẩm thành công!');
      setDeleteConfirmOpen(false);
      loadAdminData();
    } catch (err: any) {
      alert('Lỗi xóa sản phẩm: ' + err.message);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForVariants || !vSize.trim() || !vStock) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        sku: `PROD-${selectedProductForVariants.id}-${vSize.toUpperCase()}`,
        attributes: { size: vSize.trim() },
        price: selectedProductForVariants.base_price,
        stock_quantity: intValue(vStock)
      };

      const res = await fetchApi<{ success: boolean; data: any }>(`/admin/products/${selectedProductForVariants.id}/variants`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast(`Đã thêm Size ${vSize} vào kho!`);
        setSelectedProductForVariants({
          ...selectedProductForVariants,
          product_variants: [...(selectedProductForVariants.product_variants || []), res.data]
        });
        setVSize('M');
        setVStock('50');
      }
    } catch (err: any) {
      alert('Lỗi thêm biến thể Size: ' + err.message);
    }
  };

  const handleDeleteVariant = async (vId: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await fetchApi(`/admin/variants/${vId}`, { method: 'DELETE', headers });
      showToast('Đã xóa biến thể Size!');
      if (selectedProductForVariants) {
        setSelectedProductForVariants({
          ...selectedProductForVariants,
          product_variants: selectedProductForVariants.product_variants.filter((v: any) => v.id !== vId)
        });
      }
    } catch (err: any) {
      alert('Lỗi xóa biến thể Size: ' + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await fetchApi(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Đã cập nhật trạng thái đơn hàng sang ${newStatus}`);
      loadAdminData();
    } catch (err: any) {
      alert('Lỗi cập nhật trạng thái đơn hàng: ' + err.message);
    }
  };

  const resetProductForm = () => {
    setPId('');
    setPName('');
    setPSlug('');
    setPDescription('');
    setPPrice('');
    setPCategoryId('');
    setPImageUrl('');
  };

  const floatValue = (val: string) => parseFloat(val) || 0;
  const intValue = (val: string) => parseInt(val, 10) || 0;
  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getCustomerName = (ord: any) => ord.addresses?.recipient_name || ord.profiles?.full_name || 'Khách hàng';
  const getCustomerPhone = (ord: any) => ord.addresses?.phone || ord.profiles?.phone || '---';
  const getCustomerAddress = (ord: any) => {
    if (ord.addresses) {
      const a = ord.addresses;
      return `${a.detail || ''}, ${a.ward || ''}, ${a.district || ''}, ${a.province || ''}`.replace(/^,\s*/, '');
    }
    return 'Địa chỉ mặc định';
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = pSearch ? p.name.toLowerCase().includes(pSearch.toLowerCase()) : true;
    const matchCat = pCatFilter ? p.category_id === pCatFilter : true;
    return matchSearch && matchCat;
  });

  if (authLoading || (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-8">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <p className="text-base font-bold">Đang xác thực quyền Quản trị viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 font-bold text-sm border border-emerald-500">
          <Check className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200/90 p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
              SHOFY
            </span>
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold tracking-widest uppercase">
              ADMIN
            </span>
          </Link>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Thống kê</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Box className="w-5 h-5" />
              <span>Quản lý sản phẩm</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'categories'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-5 h-5" />
              <span>Quản lý danh mục</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-5 h-5" />
              <span>Quản lý đơn hàng</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === 'coupons'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Percent className="w-5 h-5" />
              <span>Mã khuyến mãi</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            <span>Về trang chủ Cửa hàng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto space-y-8 custom-scrollbar">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {activeTab === 'dashboard' && 'Thống kê & Phân tích hệ thống'}
              {activeTab === 'products' && 'Quản lý sản phẩm & Kho Size'}
              {activeTab === 'categories' && 'Quản lý danh mục sản phẩm'}
              {activeTab === 'orders' && 'Quản lý đơn hàng mua sắm'}
              {activeTab === 'coupons' && 'Mã khuyến mãi & Ưu đãi'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Theo dõi tình hình kinh doanh, báo cáo doanh thu và phân tích hiệu suất sản phẩm.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Tải lại dữ liệu</span>
          </button>
        </div>

        {/* TAB 1: ENHANCED STATISTICS & ANALYTICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 6 Key Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xl font-black text-slate-900">{formatVND(stats?.revenue || 0)}</p>
                <p className="text-[11px] text-emerald-600 font-bold">Thực nhận từ đơn đặt</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số Đơn Hàng</span>
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">{stats?.total_orders || 0}</p>
                <p className="text-[11px] text-slate-500 font-medium">Tổng số giao dịch</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã Giao Hàng</span>
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-700">{stats?.delivered_orders || 0}</p>
                <p className="text-[11px] text-emerald-700 font-bold">Hoàn thành thành công</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang Giao Hàng</span>
                  <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-sky-700">{stats?.shipping_orders || 0}</p>
                <p className="text-[11px] text-sky-700 font-medium">Đang trên đường vận chuyển</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Giá Trị TB Đơn (AOV)</span>
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xl font-black text-slate-900">{formatVND(stats?.avg_order_value || 0)}</p>
                <p className="text-[11px] text-slate-500 font-medium">Trung bình mỗi đơn</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Sản Phẩm</span>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                    <Box className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">{stats?.total_products || 447}</p>
                <p className="text-[11px] text-amber-700 font-medium">Sản phẩm đang bán</p>
              </div>
            </div>

            {/* Analytics Middle Row: Status Distribution & Category Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Order Status Distribution */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-black text-slate-900">Phân Bổ Trạng Thái Đơn Hàng</h3>
                  <p className="text-xs text-slate-500 font-medium">Tỷ lệ các đơn hàng đang xử lý và hoàn thành</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đã giao thành công
                      </span>
                      <span>{stats?.delivered_orders || 0} đơn ({stats?.total_orders ? roundPct((stats.delivered_orders / stats.total_orders) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${stats?.total_orders ? (stats.delivered_orders / stats.total_orders) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-sky-700">
                        <Truck className="w-4 h-4 text-sky-600" />
                        Đang vận chuyển
                      </span>
                      <span>{stats?.shipping_orders || 0} đơn ({stats?.total_orders ? roundPct((stats.shipping_orders / stats.total_orders) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${stats?.total_orders ? (stats.shipping_orders / stats.total_orders) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Chờ xử lý / Đã xác nhận
                      </span>
                      <span>{(stats?.pending_orders || 0) + (stats?.confirmed_orders || 0)} đơn</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats?.total_orders ? (((stats.pending_orders || 0) + (stats.confirmed_orders || 0)) / stats.total_orders) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 text-rose-700">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Đã hủy đơn
                      </span>
                      <span>{stats?.cancelled_orders || 0} đơn ({stats?.total_orders ? roundPct((stats.cancelled_orders / stats.total_orders) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${stats?.total_orders ? (stats.cancelled_orders / stats.total_orders) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Sales Breakdown Progress */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-black text-slate-900">Thống Kê Doanh Thu Theo Danh Mục</h3>
                  <p className="text-xs text-slate-500 font-medium">Tỷ lệ số lượng và doanh thu từng nhóm thời trang</p>
                </div>

                <div className="space-y-3">
                  {categoryStats.map((c, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          {c.category} ({c.count} sản phẩm)
                        </span>
                        <span className="text-emerald-700">{c.sales} lượt bán ({c.percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(c.percentage, 5)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 5 Best Selling Products Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-black text-slate-900">Top 5 Sản Phẩm Bán Chạy Nhất</h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">Xếp hạng theo số lượt mua</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 font-bold">
                    <tr>
                      <th className="p-4 rounded-l-xl">Hạng</th>
                      <th className="p-4">Hình Ảnh</th>
                      <th className="p-4">Tên Sản Phẩm</th>
                      <th className="p-4">Danh Mục</th>
                      <th className="p-4">Giá Bán</th>
                      <th className="p-4">Đã Bán</th>
                      <th className="p-4 text-right rounded-r-xl">Doanh Thu Uớc Tính</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {topSelling.map((prod, idx) => {
                      const img = prod.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400';
                      const estRev = prod.total_sold * prod.base_price;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-black text-base text-emerald-700">#{idx + 1}</td>
                          <td className="p-4">
                            <img src={img} alt="" className="w-12 h-14 object-cover rounded-xl border border-slate-200" />
                          </td>
                          <td className="p-4 font-bold text-slate-900 max-w-xs truncate">{prod.name}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                              {prod.categories?.name || 'Danh mục'}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-800">{formatVND(prod.base_price)}</td>
                          <td className="p-4 font-extrabold text-slate-900">{prod.total_sold} sp</td>
                          <td className="p-4 text-right font-black text-emerald-700">{formatVND(estRev)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">Đơn Hàng Mới Nhất</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-emerald-600 hover:underline font-bold">
                  Xem tất cả đơn hàng ➔
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 font-bold">
                    <tr>
                      <th className="p-4 rounded-l-xl">Mã Đơn</th>
                      <th className="p-4">Tên Khách Hàng</th>
                      <th className="p-4">Số Điện Thoại</th>
                      <th className="p-4">Địa Chỉ Giao Hàng</th>
                      <th className="p-4">Tổng Tiền</th>
                      <th className="p-4 rounded-r-xl">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-xs font-bold text-emerald-700">#{ord.id.slice(0, 8)}</td>
                        <td className="p-4 font-bold text-slate-900">{getCustomerName(ord)}</td>
                        <td className="p-4 font-medium">{getCustomerPhone(ord)}</td>
                        <td className="p-4 text-xs max-w-xs truncate">{getCustomerAddress(ord)}</td>
                        <td className="p-4 font-bold text-emerald-700">{formatVND(ord.total || 0)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'delivered' ? 'Đã giao hàng' : ord.status === 'cancelled' ? 'Đã hủy' : ord.status === 'shipping' ? 'Đang giao' : 'Chờ xử lý'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm..."
                    value={pSearch}
                    onChange={(e) => setPSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>

                <select
                  value={pCatFilter}
                  onChange={(e) => setPCatFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Tất cả danh mục ({categories.length})</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => { resetProductForm(); setShowProductForm(true); }}
                className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm Sản Phẩm Mới</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 font-bold">
                    <tr>
                      <th className="p-4 rounded-l-xl">Hình Ảnh</th>
                      <th className="p-4">Tên Sản Phẩm</th>
                      <th className="p-4">Danh Mục</th>
                      <th className="p-4">Giá Bán</th>
                      <th className="p-4">Kho Size</th>
                      <th className="p-4 text-right rounded-r-xl">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredProducts.map((p) => {
                      const primaryImg = p.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400';
                      const catName = p.categories?.name || 'Chưa phân loại';
                      const variantsCount = p.product_variants?.length || 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <img src={primaryImg} alt="" className="w-12 h-14 object-cover rounded-xl border border-slate-200" />
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900 max-w-xs truncate">{p.name}</p>
                            <p className="text-xs text-slate-400 font-mono">ID: {p.id.slice(0, 12)}</p>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                              {catName}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-emerald-700">{formatVND(p.base_price)}</td>
                          <td className="p-4">
                            <button
                              onClick={() => { setSelectedProductForVariants(p); setShowVariantForm(true); }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 text-xs font-bold transition-colors border border-slate-200"
                            >
                              ⚙ Size ({variantsCount})
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600 transition-colors"
                                title="Sửa sản phẩm"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setDeleteId(p.id); setDeleteTargetName(p.name); setDeleteConfirmOpen(true); }}
                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.filter(c => !c.parent_id).map((parent) => {
                const subCategories = categories.filter(c => c.parent_id === parent.id);

                return (
                  <div key={parent.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xl font-black text-slate-900">{parent.name}</h3>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                        {subCategories.length} Danh mục con
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục thành phần:</p>
                      <div className="flex flex-wrap gap-2">
                        {subCategories.map((sub) => (
                          <span key={sub.id} className="text-xs bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 font-bold">
                    <tr>
                      <th className="p-4 rounded-l-xl">Mã Đơn</th>
                      <th className="p-4">Khách Hàng</th>
                      <th className="p-4">Số Điện Thoại</th>
                      <th className="p-4">Địa Chỉ Giao Hàng</th>
                      <th className="p-4">Tổng Tiền</th>
                      <th className="p-4 text-right rounded-r-xl">Trạng Thái Đơn Hàng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-xs font-bold text-emerald-700">#{ord.id.slice(0, 8)}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{getCustomerName(ord)}</p>
                        </td>
                        <td className="p-4 font-semibold text-slate-700 flex items-center gap-1.5 mt-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getCustomerPhone(ord)}</span>
                        </td>
                        <td className="p-4 text-xs max-w-xs">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{getCustomerAddress(ord)}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-emerald-700">{formatVND(ord.total || 0)}</td>
                        <td className="p-4 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none cursor-pointer"
                          >
                            <option value="pending">⏳ Chờ xử lý</option>
                            <option value="confirmed">✅ Đã xác nhận</option>
                            <option value="shipping">🚚 Đang giao hàng</option>
                            <option value="delivered">🎉 Đã giao thành công</option>
                            <option value="cancelled">❌ Đã hủy đơn</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 flex justify-between items-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Mã Khuyến Mãi ({coupons.length})</h3>
              <button
                onClick={() => setShowCouponForm(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm Mã Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((c) => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-3 shadow-sm relative">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono font-bold text-sm rounded-lg border border-emerald-200">
                      {c.code}
                    </span>
                    <button
                      onClick={async () => {
                        const headers = { Authorization: `Bearer ${token}` };
                        await fetchApi(`/admin/coupons/${c.id}`, { method: 'DELETE', headers });
                        loadAdminData();
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    {c.discount_type === 'percent' ? `Giảm ${c.discount_value}%` : `Giảm ${formatVND(c.discount_value)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODALS REMAIN UNCHANGED & COMPLETE */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{pId ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
              <button onClick={() => setShowProductForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tên sản phẩm (*)</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => { setPName(e.target.value); if (!pId) setPSlug(toSlug(e.target.value)); }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-slate-900 font-medium"
                  placeholder="Ví dụ: Áo Khoác Bomber Đen..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Giá Bán (VNĐ) (*)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-slate-900 font-medium"
                    placeholder="250000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Danh Mục (*)</label>
                  <select
                    required
                    value={pCategoryId}
                    onChange={(e) => setPCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-slate-900 font-medium"
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">URL Hình Ảnh (Supabase Storage)</label>
                <input
                  type="text"
                  value={pImageUrl}
                  onChange={(e) => setPImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-slate-900 text-xs font-mono"
                  placeholder="https://nnywafybvxthtylhntib.supabase.co/storage/v1/object/public/Ao/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 text-slate-900 font-medium"
                  placeholder="Mô tả chi tiết..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVariantForm && selectedProductForVariants && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Quản Lý Kho Size Sản Phẩm</h3>
                <p className="text-xs text-emerald-700 font-bold mt-0.5">{selectedProductForVariants.name}</p>
              </div>
              <button onClick={() => setShowVariantForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">Các Size hiện có trong Kho:</label>
              <div className="flex flex-wrap gap-2">
                {selectedProductForVariants.product_variants?.map((v: any) => (
                  <div key={v.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900">
                    <span>Size {v.attributes?.size} ({v.stock_quantity} sp)</span>
                    <button onClick={() => handleDeleteVariant(v.id)} className="text-rose-600 hover:text-rose-800">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-4 border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Chọn Size (*)</label>
                  <input
                    type="text"
                    required
                    value={vSize}
                    onChange={(e) => setVSize(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                    placeholder="S, M, L, XL, 39, Freesize..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Số Lượng Kho (*)</label>
                  <input
                    type="number"
                    required
                    value={vStock}
                    onChange={(e) => setVStock(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                    placeholder="50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md"
              >
                + Thêm Size Vào Kho
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa sản phẩm?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-slate-900">"{deleteTargetName}"</strong> không?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteProductConfirm}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function roundPct(num: number) {
  return Math.round(num * 10) / 10;
}
