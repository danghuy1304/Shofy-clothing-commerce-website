import os
import sys
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Thiếu SUPABASE_URL hoặc SUPABASE_KEY")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_fresh_orders():
    print("===============================================================")
    print("🚀 BẮT ĐẦU XÓA DỮ LIỆU CŨ & TẠO MỚI ĐƠN HÀNG, ĐÁNH GIÁ THỰC TẾ")
    print("===============================================================\n")

    # 1. Clean existing orders, order_items, payments, addresses, reviews
    print("--- [1/3] Xóa sạch dữ liệu Đơn hàng & Đánh giá cũ ---")
    try:
        supabase.table("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("addresses").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        try:
            supabase.table("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception:
            pass
        print("  ✓ Đã xóa sạch toàn bộ dữ liệu đơn hàng và đánh giá cũ.")
    except Exception as e:
        print(f"  ⚠ Lưu ý khi xóa: {e}")

    # 2. Get Users and Products with Variants
    print("\n--- [2/3] Chuẩn bị dữ liệu Người dùng & Biến thể Sản phẩm ---")
    profiles_res = supabase.table("profiles").select("*").execute()
    profiles = profiles_res.data or []

    if not profiles:
        print("❌ Không tìm thấy người dùng nào trong profiles.")
        return

    products_res = supabase.table("products").select("id, name, base_price, product_variants(id, attributes, price)").limit(50).execute()
    products = products_res.data or []

    if not products:
        print("❌ Không tìm thấy sản phẩm nào.")
        return

    # Sample addresses list
    SAMPLE_ADDRESSES = [
        {"recipient_name": "Nguyễn Văn Hùng", "phone": "0987654321", "province": "Hà Nội", "district": "Cầu Giấy", "ward": "Dịch Vọng", "detail": "Số 15 Ngõ 80 Cầu Giấy"},
        {"recipient_name": "Trần Thị Mai", "phone": "0912345678", "province": "TP. Hồ Chí Minh", "district": "Quận 1", "ward": "Bến Nghé", "detail": "Tầng 5, 123 Lê Lợi"},
        {"recipient_name": "Lê Minh Tuấn", "phone": "0934567890", "province": "Đà Nẵng", "district": "Hải Châu", "ward": "Hòa Cường Bắc", "detail": "45 Nguyễn Văn Linh"},
        {"recipient_name": "Phạm Hoàng Nam", "phone": "0978123456", "province": "Hải Phòng", "district": "Nôg Quyền", "ward": "Lạ Tray", "detail": "88 Lạch Tray"},
        {"recipient_name": "Vũ Thị Ngọc", "phone": "0909876543", "province": "Cần Thơ", "district": "Ninh Kiều", "ward": "Tân An", "detail": "12 Hòa Bình"},
    ]

    addresses_to_insert = []
    for idx, prof in enumerate(profiles[:10]):
        addr_info = SAMPLE_ADDRESSES[idx % len(SAMPLE_ADDRESSES)]
        addresses_to_insert.append({
            "user_id": prof["id"],
            "recipient_name": prof.get("full_name") or addr_info["recipient_name"],
            "phone": prof.get("phone") or addr_info["phone"],
            "province": addr_info["province"],
            "district": addr_info["district"],
            "ward": addr_info["ward"],
            "detail": addr_info["detail"],
            "is_default": True
        })

    addr_res = supabase.table("addresses").insert(addresses_to_insert).execute()
    inserted_addresses = addr_res.data or []
    print(f"  ✓ Đã tạo {len(inserted_addresses)} địa chỉ giao hàng mới.")

    # 3. Create 15 Realistic Orders
    print("\n--- [3/3] Tạo mới 15 Đơn hàng chuẩn dữ liệu ---")
    STATUS_CHOICES = ["delivered", "delivered", "shipping", "confirmed", "pending", "cancelled"]
    
    for i in range(15):
        addr = inserted_addresses[i % len(inserted_addresses)]
        user_id = addr["user_id"]
        status = STATUS_CHOICES[i % len(STATUS_CHOICES)]
        
        # Pick 1..3 random products
        chosen_prods = random.sample(products, random.randint(1, 3))
        subtotal = 0.0
        order_items = []

        for p in chosen_prods:
            price = p["base_price"]
            qty = random.randint(1, 2)
            subtotal += price * qty
            variants = p.get("product_variants") or []
            v_id = variants[0]["id"] if variants else None
            v_attr = variants[0].get("attributes") if variants else {"size": "M"}

            order_items.append({
                "variant_id": v_id,
                "product_name": p["name"],
                "variant_attributes": v_attr,
                "price": price,
                "quantity": qty
            })

        shipping_fee = 30000.0
        discount = 50000.0 if i % 3 == 0 else 0.0
        total = subtotal + shipping_fee - discount

        order_data = {
            "user_id": user_id,
            "address_id": addr["id"],
            "status": status,
            "subtotal": subtotal,
            "discount_amount": discount,
            "shipping_fee": shipping_fee,
            "total": max(total, 0.0),
            "coupon_code": "SUMMER2026" if discount > 0 else None,
            "note": "Giao hàng vào giờ hành chính"
        }

        created_order = supabase.table("orders").insert(order_data).execute()
        if created_order.data:
            ord_id = created_order.data[0]["id"]
            for item in order_items:
                item["order_id"] = ord_id
                supabase.table("order_items").insert(item).execute()
            print(f"  ... Đã tạo đơn hàng #{ord_id[:8]} - Trạng thái: {status} - Tổng tiền: {total:,.0f}đ")

    print("\n===============================================================")
    print("🎉 HOÀN THÀNH LÀM SẠCH VÀ TẠO MỚI DỮ LIỆU ĐƠN HÀNG THỰC TẾ!")
    print("===============================================================")

if __name__ == "__main__":
    seed_fresh_orders()
