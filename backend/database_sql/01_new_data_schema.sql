-- =====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR LUXFASHION E-COMMERCE (INTEGER IDs)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Lưu trữ tài khoản người dùng)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SUPPLIERS (Nhà cung cấp - ID integer 1..90)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES (Danh mục - ID integer 1..30)
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS (Sản phẩm - ID integer 1..448)
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    supplier_id BIGINT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    avg_rating NUMERIC(2, 1) NOT NULL DEFAULT 4.8 CHECK (avg_rating >= 0 AND avg_rating <= 5.0),
    total_sold INTEGER NOT NULL DEFAULT 12 CHECK (total_sold >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS (Biến thể Size + Số lượng tồn kho)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    size TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCT IMAGES (Hình ảnh sản phẩm - ID integer 1..447)
CREATE TABLE IF NOT EXISTS public.product_images (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 7. REVIEWS (Đánh giá)
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL DEFAULT 'Khách hàng',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COUPONS (Mã giảm giá)
CREATE TABLE IF NOT EXISTS public.coupons (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- RLS Policies (Public Read for Storefront)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public suppliers" ON public.suppliers;
CREATE POLICY "Public suppliers" ON public.suppliers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public categories" ON public.categories;
CREATE POLICY "Public categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products" ON public.products;
CREATE POLICY "Public products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public variants" ON public.product_variants;
CREATE POLICY "Public variants" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public images" ON public.product_images;
CREATE POLICY "Public images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews" ON public.reviews;
CREATE POLICY "Public reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public coupons" ON public.coupons;
CREATE POLICY "Public coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public orders" ON public.orders;
CREATE POLICY "Public orders" ON public.orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Public order_items" ON public.order_items;
CREATE POLICY "Public order_items" ON public.order_items FOR ALL USING (true);
