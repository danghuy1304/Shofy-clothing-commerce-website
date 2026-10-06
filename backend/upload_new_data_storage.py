import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Reconfigure stdout for UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Lỗi: Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file backend/.env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Đường dẫn đến thư mục new_data
NEW_DATA_DIR = r"D:\AI_My_Project\website-shofy-clothing-ecommerce\tài liệu thiết kế\new_data"

# Ánh xạ thư mục gốc tiếng Việt -> Tên Bucket không dấu trên Supabase
BUCKET_MAP = {
    "Áo": "Ao",
    "Quần": "Quan",
    "Giày": "Giay",
    "Mũ": "Mu",
    "Găng": "Gang",
    "TuiXach": "TuiXach",
    "PhuKien": "PhuKien"
}

def get_mime_type(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".png":
        return "image/png"
    elif ext in [".jpg", ".jpeg"]:
        return "image/jpeg"
    elif ext == ".webp":
        return "image/webp"
    return "application/octet-stream"

def upload_all_images():
    print("===============================================================")
    print("🚀 BẮT ĐẦU TỰ ĐỘNG TẢI 446 ẢNH LÊN SUPABASE STORAGE BUCKETS")
    print("===============================================================\n")

    # 1. Đảm bảo tất cả 7 Bucket không dấu đã được tạo & để chế độ public
    print("--- [1/2] Kiểm tra & khởi tạo 7 Buckets không dấu ---")
    for local_folder, bucket_name in BUCKET_MAP.items():
        try:
            try:
                supabase.storage.get_bucket(bucket_name)
                print(f"  ✓ Bucket '{bucket_name}' đã tồn tại.")
            except Exception:
                supabase.storage.create_bucket(bucket_name, options={"public": True})
                print(f"  ✨ Đã tạo mới Bucket công khai: '{bucket_name}'")
        except Exception as e:
            print(f"  ⚠ Lưu ý khi kiểm tra/tạo bucket '{bucket_name}': {e}")

    # 2. Duyệt qua tất cả file ảnh và Upload
    print("\n--- [2/2] Tiến hành upload toàn bộ ảnh vào các thư mục tương ứng ---")
    uploaded_count = 0
    failed_count = 0

    for root, dirs, files in os.walk(NEW_DATA_DIR):
        for filename in files:
            if filename == "luxfashion.sql":
                continue
            
            local_file_path = os.path.join(root, filename)
            rel_path = os.path.relpath(local_file_path, NEW_DATA_DIR)
            parts = rel_path.split(os.sep)

            if len(parts) >= 3:
                root_folder = parts[0]      # ví dụ: 'Áo'
                sub_folder = parts[1]       # ví dụ: 'Ao_thun'
                file_name = parts[2]        # ví dụ: 'AoThun_1.jpg'

                if root_folder in BUCKET_MAP:
                    bucket_name = BUCKET_MAP[root_folder]
                    storage_path = f"{sub_folder}/{file_name}"
                    mime_type = get_mime_type(file_name)

                    try:
                        with open(local_file_path, "rb") as f:
                            file_bytes = f.read()

                        # Upload file (upsert=True để tự động ghi đè nếu đã có)
                        res = supabase.storage.from_(bucket_name).upload(
                            path=storage_path,
                            file=file_bytes,
                            file_options={"content-type": mime_type, "upsert": "true"}
                        )

                        uploaded_count += 1

                        if uploaded_count % 50 == 0 or uploaded_count == 446:
                            print(f"  [Progress] Đã tải lên {uploaded_count}/446 ảnh thành công...")

                    except Exception as e:
                        failed_count += 1
                        print(f"  ❌ Lỗi tải file '{rel_path}': {e}")

    print("\n===============================================================")
    print(f"🎉 HOÀN THÀNH: {uploaded_count}/446 ảnh đã được tải lên thành công!")
    if failed_count > 0:
        print(f"⚠ Có {failed_count} file thất bại.")
    print("===============================================================")

if __name__ == "__main__":
    upload_all_images()
