import os
import sys
import re
import urllib.parse
import unicodedata
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
SQL_FILE = r"D:\AI_My_Project\website-shofy-clothing-ecommerce\tài liệu thiết kế\new_data\luxfashion.sql"

BUCKET_MAP = {
    "Áo": "Ao",
    "Quần": "Quan",
    "Giày": "Giay",
    "Mũ": "Mu",
    "Găng": "Gang",
    "TuiXach": "TuiXach",
    "PhuKien": "PhuKien"
}

# 7 Main Parent Groups (Buckets)
PARENT_GROUPS = [
    {"id_num": 101, "name": "Áo", "slug": "ao", "bucket": "Ao"},
    {"id_num": 102, "name": "Quần", "slug": "quan", "bucket": "Quan"},
    {"id_num": 103, "name": "Giày", "slug": "giay", "bucket": "Giay"},
    {"id_num": 104, "name": "Mũ", "slug": "mu", "bucket": "Mu"},
    {"id_num": 105, "name": "Găng", "slug": "gang", "bucket": "Gang"},
    {"id_num": 106, "name": "Túi xách", "slug": "tui-xach", "bucket": "TuiXach"},
    {"id_num": 107, "name": "Phụ kiện", "slug": "phu-kien", "bucket": "PhuKien"},
]

def make_uuid(prefix, int_id):
    return f"{prefix}-0000-0000-0000-{int_id:012x}"

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    text = re.sub(r'[-\s]+', '-', text)
    return text or 'item'

def seed():
    print("===============================================================")
    print("🚀 BẮT ĐẦU RE-SEED DỮ LIỆU CHUẨN 7 BUCKET & 23 FOLDER CHI TIẾT")
    print("===============================================================\n")

    with open(SQL_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # 1. Clean existing product_images, product_variants, products, categories
    print("--- [1/5] Dọn dẹp dữ liệu cũ trong Supabase ---")
    try:
        supabase.table("product_variants").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("product_images").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("products").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("  ✓ Đã dọn dẹp dữ liệu cũ thành công.")
    except Exception as e:
        print(f"  ⚠ Lưu ý khi dọn dẹp: {e}")

    # 2. Build 7 Parent Groups (Buckets) + 23 Subcategory Folders
    categories = []
    parent_map = {} # parent_id_num -> UUID

    # Insert 7 Parent Groups
    for p in PARENT_GROUPS:
        puuid = make_uuid("00000000", p["id_num"])
        parent_map[p["id_num"]] = puuid
        categories.append({
            "id": puuid,
            "name": p["name"],
            "slug": p["slug"],
            "parent_id": None
        })

    # Parse 30 subcategories and link to their 7 Parent Groups
    cat_section = sql_content[sql_content.find("INSERT INTO categories"):sql_content.find("INSERT INTO suppliers")]
    cat_matches = re.findall(r'\((\d+),\s*\'([^\']+)\'\)', cat_section)

    for cid, name in cat_matches:
        cid_int = int(cid)
        c_uuid = make_uuid("00000000", cid_int)

        # Map cid_int to Parent Group ID
        if 1 <= cid_int <= 7:
            parent_uuid = parent_map[101] # Áo
        elif 20 <= cid_int <= 23:
            parent_uuid = parent_map[102] # Quần
        elif 11 <= cid_int <= 15:
            parent_uuid = parent_map[103] # Giày
        elif 16 <= cid_int <= 19:
            parent_uuid = parent_map[104] # Mũ
        elif 8 <= cid_int <= 10:
            parent_uuid = parent_map[105] # Găng
        elif 28 <= cid_int <= 30:
            parent_uuid = parent_map[106] # Túi xách
        else: # 24..27
            parent_uuid = parent_map[107] # Phụ kiện

        categories.append({
            "id": c_uuid,
            "name": name,
            "slug": slugify(name),
            "parent_id": parent_uuid
        })

    print(f"\n--- [2/5] Seed {len(categories)} Categories (7 Parent Buckets + 23 Sub-Folders) ---")
    try:
        supabase.table("categories").upsert(categories).execute()
        print(f"  ✓ Đã nạp thành công {len(categories)} danh mục phân tầng.")
    except Exception as e:
        print(f"  ❌ Lỗi Categories: {e}")

    # 3. Parse & Seed Products (448 items)
    prod_section = sql_content[sql_content.find("INSERT INTO products"):sql_content.find("INSERT INTO images")]
    prod_matches = re.findall(r'\((\d+),\s*\'([^\']*)\',\s*\'([^\']*)\',\s*(\d+),\s*(\d+),\s*(\d+)\)', prod_section)
    products = []
    for pid, desc, name, price, cat_id, sup_id in prod_matches:
        pid_int = int(pid)
        cat_int = int(cat_id)
        desc = desc.replace("\\'", "'")
        name = name.replace("\\'", "'")
        p_uuid = make_uuid("10000000", pid_int)
        c_uuid = make_uuid("00000000", cat_int)
        slug = f"{slugify(name)}-{pid_int}"

        products.append({
            "id": p_uuid,
            "category_id": c_uuid,
            "name": name,
            "slug": slug,
            "description": desc,
            "base_price": float(price),
            "status": "active",
            "avg_rating": round(4.5 + (pid_int % 5) * 0.1, 1),
            "total_sold": 12 + (pid_int % 38)
        })

    print(f"\n--- [3/5] Seed {len(products)} Products ---")
    for i in range(0, len(products), 100):
        chunk = products[i:i+100]
        try:
            supabase.table("products").upsert(chunk).execute()
            print(f"  ... Đã nạp sản phẩm {i+1} -> {i+len(chunk)}")
        except Exception as e:
            print(f"  ❌ Lỗi Products chunk {i}: {e}")

    # 4. Parse & Seed Product Images (447 items)
    img_section = sql_content[sql_content.find("INSERT INTO images"):sql_content.find("INSERT INTO promotions")]
    img_matches = re.findall(r'\((\d+),\s*\'([^\']+)\',\s*(\d+)\)', img_section)
    product_images = []

    for img_id, raw_url, prod_id in img_matches:
        img_int = int(img_id)
        prod_int = int(prod_id)
        i_uuid = make_uuid("20000000", img_int)
        p_uuid = make_uuid("10000000", prod_int)

        decoded_url = urllib.parse.unquote(raw_url)
        parts = decoded_url.split("anh_Lux/")
        if len(parts) > 1:
            path_parts = parts[1].split("/")
            root_folder = path_parts[0]
            if root_folder in BUCKET_MAP:
                bucket_name = BUCKET_MAP[root_folder]
                sub_path = "/".join(path_parts[1:])
                storage_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{sub_path}"
                product_images.append({
                    "id": i_uuid,
                    "product_id": p_uuid,
                    "image_url": storage_url,
                    "is_primary": True,
                    "display_order": 0
                })

    print(f"\n--- [4/5] Seed {len(product_images)} Product Images ---")
    for i in range(0, len(product_images), 100):
        chunk = product_images[i:i+100]
        try:
            supabase.table("product_images").upsert(chunk).execute()
            print(f"  ... Đã nạp hình ảnh {i+1} -> {i+len(chunk)}")
        except Exception as e:
            print(f"  ❌ Lỗi Images chunk {i}: {e}")

    # 5. Seed Product Variants (Size + Stock Quantity)
    print(f"\n--- [5/5] Seed Size Variants cho 448 Products ---")
    variants = []
    var_counter = 1

    for p in products:
        p_uuid = p["id"]
        cat_id = int(p["category_id"].split("-")[-1], 16)
        price = p["base_price"]

        if (1 <= cat_id <= 7) or (20 <= cat_id <= 23):
            sizes = ['S', 'M', 'L', 'XL', 'XXL']
        elif 11 <= cat_id <= 15:
            sizes = ['38', '39', '40', '41', '42', '43']
        else:
            sizes = ['Freesize']

        for sz in sizes:
            v_uuid = make_uuid("30000000", var_counter)
            variants.append({
                "id": v_uuid,
                "product_id": p_uuid,
                "sku": f"PROD-{cat_id}-{var_counter}-{sz}",
                "attributes": {"size": sz},
                "price": price,
                "stock_quantity": 50
            })
            var_counter += 1

    for i in range(0, len(variants), 200):
        chunk = variants[i:i+200]
        try:
            supabase.table("product_variants").upsert(chunk).execute()
            print(f"  ... Đã nạp biến thể {i+1} -> {i+len(chunk)}")
        except Exception as e:
            print(f"  ❌ Lỗi Variants chunk {i}: {e}")

    print("\n===============================================================")
    print("🎉 HOÀN THÀNH TOÀN BỘ RE-SEED DỮ LIỆU PHÂN TẦNG BUCKET & FOLDER!")
    print("===============================================================")

if __name__ == "__main__":
    seed()
