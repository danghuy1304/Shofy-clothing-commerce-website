import os
import sys
import uuid
import random
import hashlib
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from supabase import create_client

# Reconfigure stdout for UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong file .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

# Pool of 30 realistic Vietnamese reviewers
VIETNAMESE_NAMES = [
    ("Nguyễn Văn Hùng", "hung.nguyen@gmail.com"),
    ("Trần Thị Lan", "lan.tran@gmail.com"),
    ("Lê Hoàng Nam", "nam.le@gmail.com"),
    ("Phạm Minh Tuấn", "tuan.pham@gmail.com"),
    ("Vũ Thu Trang", "trang.vu@gmail.com"),
    ("Hoàng Đức Anh", "ducanh.hoang@gmail.com"),
    ("Đặng Minh Ngọc", "ngoc.dang@gmail.com"),
    ("Ngô Quốc Bảo", "bao.ngo@gmail.com"),
    ("Bùi Phương Thảo", "thao.bui@gmail.com"),
    ("Đỗ Tuấn Kiệt", "kiet.do@gmail.com"),
    ("Phan Ngọc Vy", "vy.phan@gmail.com"),
    ("Tống Khánh Linh", "linh.tong@gmail.com"),
    ("Lý Minh Triết", "triet.ly@gmail.com"),
    ("Trịnh Gia Bảo", "giabao.trinh@gmail.com"),
    ("Mai Thu Hà", "ha.mai@gmail.com"),
    ("Vương Đình Phong", "phong.vuong@gmail.com"),
    ("Lương Bích Thủy", "thuy.luong@gmail.com"),
    ("Dương Anh Tuấn", "anhtuan.duong@gmail.com"),
    ("Hồ Mỹ Tâm", "mytam.ho@gmail.com"),
    ("Cao Thanh Sơn", "son.cao@gmail.com"),
    ("Nguyễn Hồng Nhung", "nhung.nguyen@gmail.com"),
    ("Đinh Trọng Hiếu", "hieu.dinh@gmail.com"),
    ("Lê Thị Kim Oanh", "oanh.le@gmail.com"),
    ("Nguyễn Bảo Long", "long.nguyen@gmail.com"),
    ("Phan Thị Mỹ Duyên", "duyen.phan@gmail.com"),
]

# Extremely rich review templates categorized by product types
REVIEW_TEMPLATES = {
    # Áo thun / Áo phông / Polo
    "shirts_tshirts": {
        "pos": [
            "Áo thun chất vải cotton 100% co giãn 4 chiều cực kỳ mát tay. Mình cao 1m72 nặng 65kg mặc size L cực đẹp, vừa vặn không bị ôm sát quá.",
            "Chất vải mềm mịn, thấm hút mồ hôi rất tốt khi vận động thể thao. Giặt máy 3-4 lần rồi vẫn giữ form tốt không bị nhão hay xù lông.",
            "Màu sắc bên ngoài nhã nhặn, tươi tắn như hình. Phối với quần jean xanh hoặc quần short kaki đi dạo phố hay du lịch đều rất hợp mốt.",
            "Form áo dáng suông rộng rãi thoải mái. Đường kim mũi chỉ chắc chắn không có chỉ thừa. Giá hợp lý so với chất lượng cao cấp.",
            "Áo mặc rất mát cho mùa hè nóng bức. Bạn mình ai cũng khen áo đẹp và hỏi mua ở đâu. Sẽ ghé shop mua thêm các màu khác!",
            "Thiết kế đơn giản mà sang trọng. Vải dày dặn vừa phải, không lộ nội y. Mặc đi học hay đi làm tự tin hẳn."
        ],
        "neu": [
            "Chất vải mặc mát nhưng form hơi rộng so với bảng size chuẩn 1 chút. Ai thích mặc ôm vừa người nên lùi 1 size nha.",
            "Áo đẹp, chất liệu ổn trong tầm giá. Giao hàng hơi lâu xíu nhưng đóng gói kỹ càng nên vẫn cho 4 sao.",
            "Màu sắc bên ngoài hơi đậm hơn ảnh trên web tầm 5%, còn lại chất vải và đường may đều rất ok."
        ],
        "neg": [
            "Áo giặt lần đầu hơi ra màu nhẹ, mọi người nhớ giặt riêng với đồ trắng. Chất vải tạm ổn.",
            "Form áo hơi dài so với chiều cao 1m60 của mình, phải đem đi cắt bớt gấu áo."
        ]
    },
    # Áo sơ mi & Áo kiểu / Áo khoác
    "shirts_blouses": {
        "pos": [
            "Áo sơ mi vải lụa đũi mềm mịn sờ rất sướng tay. Ít nhăn sau khi giặt, mặc đi làm công sở trông rất thanh lịch và chuyên nghiệp.",
            "Form áo chuẩn đẹp tôn dáng. Cổ áo đính khuy đứng dáng sắc nét. Phối cùng quần tây đen hoặc chân váy xếp ly cực kỳ quý phái.",
            "Đóng gói siêu cẩn thận bọc 2 lớp zip. Áo mở ra phẳng phiu thơm tho. Chất liệu cao cấp mặc không bị nóng bí mồ hôi.",
            "Áo khoác dáng cardigan / blazer khoác ngoài nhẹ nhàng rất phong cách. Mặc đi dạo buổi tối hoặc ngồi phòng máy lạnh rất ấm áp.",
            "Đường may tinh tế, chất vải đứng form không bị rủ. Mình cao 1m65 52kg mặc size M vừa như in luôn.",
            "Màu sắc pastel thời thượng, rất dễ phối đồ với phụ kiện túi xách và giày cao gót."
        ],
        "neu": [
            "Áo sơ mi chất đẹp nhưng mỏng hơn mình nghĩ một chút, nên mặc áo lót dây bên trong cho kín đáo.",
            "Form áo hơi ôm phần nách, bạn nào vai rộng nên tăng 1 size để vận động thoải mái hơn.",
            "Áo đẹp nhưng vải dễ nhăn nếu gấp lại, nên treo bằng móc áo sau khi giặt."
        ],
        "neg": [
            "Khuy áo đính hơi nới tay, mình phải khâu lại 1 cúc ở ngực cho chắc chắn.",
            "Vải hơi thô lúc mới bóc hộp, phải giặt qua nước xả vải mới mềm mịn."
        ]
    },
    # Quần jean / Quần tây / Quần short
    "jeans": {
        "pos": [
            "Quần jean chất denim cao cấp co giãn nhẹ, mặc di chuyển ngồi làm việc cả ngày không hề bị gò bó hay tức bụng.",
            "Form quần dáng đứng (straight fit) hack dáng chân dài cực kỳ. Giặt không bị ra màu hay co rút vải.",
            "Túi quần sâu rộng vừa vặn cho điện thoại iPhone Pro Max. Đường chỉ may dằn góc rất chắc chắn và thời trang.",
            "Quần tây ống rộng tôn dáng chiều cao. Chất vải tuyết mưa phẳng lì không nhăn, mặc đi làm hay đi sự kiện đều rất sang.",
            "Khóa kéo trơn tru, đĩa quần may cẩn thận. Màu sắc bụi bặm cá tính rất dễ phối với các loại áo thun và sơ mi.",
            "Chất lượng vượt kỳ vọng! Mình 1m78 nặng 70kg mặc size 31 vừa khít eo và độ dài hoàn hảo."
        ],
        "neu": [
            "Quần jean vải hơi dày dặn nên mặc mùa hè trưa nắng sẽ hơi nóng một chút, bù lại form lên cực kỳ đứng dáng.",
            "Ống quần hơi dài so với chiều cao 1m58 của mình, phải cắt bớt 3cm gấu quần.",
            "Cạp quần hơi rộng hơn bảng size khoảng 1-2cm, đeo thêm thắt lưng là vừa đẹp."
        ],
        "neg": [
            "Màu quần bên ngoài hơi tối hơn trên ảnh chụp một chút. Chất vải jean cứng lúc chưa giặt.",
            "Túi sau quần may hơi nông, cài ví tiền hơi chật."
        ]
    },
    # Giày / Sneaker / Giày cao gót
    "footwear": {
        "pos": [
            "Giày đi siêu êm chân! Lót giày có đệm khí cao su đàn hồi tốt, đi bộ dạo phố cả ngày không hề bị đau gót hay mỏi chân.",
            "Form giày ôm chân rất đẹp, đế cao 4cm giúp ăn gian chiều cao tự nhiên. Đế có viền may chống bung keo cực kỳ bền.",
            "Chất liệu da tổng hợp cao cấp láng mịn, dễ lau chùi khi bám bẩn. Mới đi 1 tuần mà ai cũng khen mẫu giày lạ và cá tính.",
            "Giày đóng gói hộp cứng cáp kèm túi chống bụi và dây dự phòng. Shop phục vụ rất chu đáo và chuyên nghiệp.",
            "Đế cao su bám đường tốt không bị trượt khi đi trời mưa. Phối cùng quần jean hay chân váy ngắn đều tôn dáng xuất sắc.",
            "Size chuẩn theo bảng đo foot length. Chân mình 24.5cm chọn size 39 đi vừa vặn không bị nhấc gót."
        ],
        "neu": [
            "Giày đi đẹp nhưng da hơi cứng trong 2-3 ngày đầu, đi quen chân rồi thì rất êm ái.",
            "Phần mũi giày hơi ôm ngang, chân bạn nào bè ngang nên cân nhắc nhích lên 1 size nha.",
            "Hộp giày lúc nhận hơi bị móp góc nhẹ do vận chuyển, nhưng may mắn giày bên trong không bị làm sao."
        ],
        "neg": [
            "Dây giày hơi dài so với thiết kế, phải buộc nơ 2 vòng mới không chạm đất.",
            "Mùi keo mới hơi nồng lúc bóc hộp, để nơi thoáng gió 1 ngày là hết hẳn."
        ]
    },
    # Mũ / Găng tay / Phụ kiện / Túi xách
    "accessories": {
        "pos": [
            "Túi xách chất da PU mềm mại cao cấp, không có mùi nhựa hôi. Khóa kéo kim loại mạ vàng sang trọng và rất trơn tru.",
            "Túi thiết kế nhiều ngăn thông minh, chứa đủ ví tiền, điện thoại, son phấn và chìa khóa xe. Rất tiện lợi cho chị em đi làm đi chơi.",
            "Mũ lưỡi trai / Mũ nồi dáng cứng cáp không bị móp form. Chất vải kaki dày dặn chống nắng tốt, quai chỉnh size linh hoạt.",
            "Găng tay da / len giữ ấm cực kỳ tốt trong mùa lạnh. Lót lông bên trong êm ái, có cảm ứng điện thoại ở ngón trỏ rất tiện.",
            "Phụ kiện hoàn thiện vô cùng tỉ mỉ, chi tiết sắc nét không có vết xước. Làm quà tặng cho người thân cực kỳ lịch sự.",
            "Phối cùng bộ trang phục giúp nâng tầm phong cách ăn mặc rõ rệt. Đáng đồng tiền bát gạo!"
        ],
        "neu": [
            "Túi xách dung tích nhỏ hơn mình nghĩ một chút, vừa đủ đựng đồ trang điểm chứ không để vừa iPad.",
            "Mũ đội vừa vặn nhưng màu sắc bên ngoài hơi đậm hơn hình mẫu đeo.",
            "Quai đeo túi hơi dài so với chiều cao 1m55, phải đục thêm 1 lỗ quai."
        ],
        "neg": [
            "Mặt khóa kim loại hơi bám vân tay, cần thỉnh thoảng dùng khăn mềm lau sạch.",
            "Đường may lót túi bên trong hơi nới chỉ nhẹ ở góc."
        ]
    },
    # Fallback generic
    "generic": {
        "pos": [
            "Sản phẩm đẹp vượt kỳ vọng! Chất liệu cao cấp, đường may tỉ mỉ. Giao hàng nhanh và bọc hàng rất cẩn thận.",
            "Rất hài lòng với chất lượng sản phẩm của Shofy Luxury. Đã mua lần thứ 3 ở shop và chưa bao giờ thất vọng.",
            "Màu sắc và kiểu dáng đúng như mô tả 100%. Tư vấn size rất chính xác. Khuyên mọi người nên mua thử!",
            "Chất lượng tuyệt vời so với mức giá. Sẽ tiếp tục theo dõi và ủng hộ các bộ sưu tập mới của shop."
        ],
        "neu": [
            "Sản phẩm tạm ổn trong tầm giá. Giao hàng hơi lâu xíu nhưng chất lượng hài lòng.",
            "Đóng gói cẩn thận, sản phẩm giống hình tầm 90%. Cho shop 4 sao chất lượng."
        ],
        "neg": [
            "Sản phẩm ổn nhưng thời gian giao hàng hơi chậm hơn dự kiến 2 ngày.",
            "Form áo hơi nhỏ so với bảng quy đổi, nên chọn tăng 1 size."
        ]
    }
}

SUFFIXES = [
    " Khuyên mọi người nên mua nha!",
    " Sẽ ủng hộ shop dài dài.",
    " Rất đáng tiền mua luôn.",
    " Đóng gói sản phẩm siêu cẩn thận.",
    " Giao hàng nhanh, chú shipper thân thiện.",
    " Đồ đẹp lắm, cho shop 5 sao chất lượng!",
    " Đã giới thiệu cho đồng nghiệp cùng mua.",
    " Rất hài lòng với trải nghiệm mua sắm này."
]

def classify_templates(category_slug: str) -> str:
    slug = (category_slug or "").lower()
    if any(k in slug for k in ["ao", "thun", "phong", "polo"]):
        return "shirts_tshirts"
    elif any(k in slug for k in ["so-mi", "somi", "kieu", "blazer", "khoac"]):
        return "shirts_blouses"
    elif any(k in slug for k in ["quan", "jean", "tay", "short", "kaki"]):
        return "jeans"
    elif any(k in slug for k in ["giay", "sneaker", "boot", "dep", "guoc"]):
        return "footwear"
    elif any(k in slug for k in ["mu", "nong", "gang", "tui", "vi", "phu-kien", "khac"]):
        return "accessories"
    return "generic"

def seed_reviews():
    print("=========================================================================")
    print("🚀 BẮT ĐẦU GENERATE BỘ ĐÁNH GIÁ & BÌNH LUẬN CHI TIẾT (FULL REVIEWS FOR AI)")
    print("=========================================================================\n")

    # 1. Lấy danh sách sản phẩm
    print("-> 1. Đang lấy toàn bộ danh sách sản phẩm từ database...")
    products_res = supabase.table("products").select("id, name, category_id, categories(name, slug)").execute()
    products = products_res.data or []
    if not products:
        print("❌ Không tìm thấy sản phẩm nào trong database!")
        sys.exit(1)
    print(f"  ✓ Tìm thấy tổng cộng {len(products)} sản phẩm.\n")

    # 2. Đảm bảo danh sách reviewer profiles
    print("-> 2. Đang kiểm tra & tạo danh sách Reviewers...")
    profiles_res = supabase.table("profiles").select("id, email, full_name").execute()
    profiles = profiles_res.data or []
    existing_emails = {p["email"] for p in profiles}

    new_users = []
    pwd_hash = hash_password("123456")
    for name, email in VIETNAMESE_NAMES:
        if email not in existing_emails:
            user_uuid = str(uuid.uuid4())
            new_users.append({
                "id": user_uuid,
                "email": email,
                "password_hash": pwd_hash,
                "full_name": name,
                "phone": f"0912{random.randint(100000, 999999)}",
                "role": "customer",
                "avatar_url": f"https://api.dicebear.com/7.x/adventurer/svg?seed={email.split('@')[0]}"
            })

    if new_users:
        print(f"  -> Đang nạp thêm {len(new_users)} người dùng mới vào DB...")
        for k in range(0, len(new_users), 10):
            supabase.table("profiles").insert(new_users[k:k+10]).execute()
        profiles_res = supabase.table("profiles").select("id, email, full_name").execute()
        profiles = profiles_res.data or []

    print(f"  ✓ Tổng số Reviewers sẵn sàng: {len(profiles)} người dùng.\n")

    # 3. Xóa sạch reviews cũ
    print("-> 3. Đang dọn dẹp các đánh giá cũ...")
    try:
        supabase.table("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("  ✓ Đã xóa sạch reviews cũ thành công!\n")
    except Exception as clean_err:
        print(f"  ⚠ Lỗi dọn dẹp: {clean_err}\n")

    # 4. Generate reviews chi tiết cho từng sản phẩm
    print("-> 4. Đang generate 4–8 đánh giá chi tiết cho từng sản phẩm...")
    reviews_to_insert = []
    ratings_choices = [5, 4, 3, 2, 1]
    ratings_weights = [0.70, 0.18, 0.08, 0.03, 0.01]  # Tỷ lệ đánh giá tích cực cao cho e-commerce cao cấp
    now = datetime.now(timezone.utc)

    for p in products:
        p_id = p["id"]
        cat_info = p.get("categories") or {}
        cat_slug = cat_info.get("slug") if isinstance(cat_info, dict) else ""
        cat_key = classify_templates(cat_slug)
        templates = REVIEW_TEMPLATES[cat_key]

        # 4 đến 7 đánh giá ngẫu nhiên cho mỗi sản phẩm
        num_reviews = random.randint(4, 7)
        reviewers = random.sample(profiles, min(num_reviews, len(profiles)))

        for reviewer in reviewers:
            rating = random.choices(ratings_choices, weights=ratings_weights)[0]

            if rating >= 4:
                comment_base = random.choice(templates["pos"])
                suffix = random.choice(SUFFIXES) if random.random() > 0.4 else ""
            elif rating == 3:
                comment_base = random.choice(templates["neu"])
                suffix = ""
            else:
                comment_base = random.choice(templates["neg"])
                suffix = ""

            comment = f"{comment_base}{suffix}"

            days_ago = random.randint(1, 120)
            hours_ago = random.randint(0, 23)
            created_at = now - timedelta(days=days_ago, hours=hours_ago)

            reviews_to_insert.append({
                "id": str(uuid.uuid4()),
                "product_id": p_id,
                "user_id": reviewer["id"],
                "rating": rating,
                "comment": comment,
                "created_at": created_at.isoformat()
            })

    print(f"  -> Tổng số {len(reviews_to_insert)} bản ghi đánh giá được tạo. Đang chèn vào Database...")

    # Chèn lô 50 bản ghi
    for k in range(0, len(reviews_to_insert), 50):
        batch = reviews_to_insert[k:k+50]
        supabase.table("reviews").insert(batch).execute()
        if (k // 50) % 10 == 0:
            print(f"  ... Đã chèn {min(k+50, len(reviews_to_insert))}/{len(reviews_to_insert)} reviews.")

    print(f"  ✓ Đã chèn thành công {len(reviews_to_insert)} đánh giá vào database!\n")

    # 5. Cập nhật avg_rating cho từng sản phẩm
    print("-> 5. Đang tính toán và cập nhật lại điểm trung bình avg_rating cho tất cả sản phẩm...")
    all_reviews_res = supabase.table("reviews").select("product_id, rating").execute()
    all_reviews = all_reviews_res.data or []

    product_ratings = {}
    for r in all_reviews:
        pid = r["product_id"]
        rating = r["rating"]
        if pid not in product_ratings:
            product_ratings[pid] = []
        product_ratings[pid].append(rating)

    updated_count = 0
    for pid, ratings in product_ratings.items():
        avg_score = round(sum(ratings) / len(ratings), 1)
        try:
            supabase.table("products").update({"avg_rating": avg_score}).eq("id", pid).execute()
            updated_count += 1
        except Exception as e:
            pass

    print(f"  ✓ Đã tính toán và cập nhật avg_rating cho {updated_count} sản phẩm.\n")
    print("=========================================================================")
    print("🎉 TẤT CẢ SẢN PHẨM ĐÃ CÓ ĐẦY ĐỦ ĐÁNH GIÁ & BÌNH LUẬN PHONG PHÚ CHO AI!")
    print("=========================================================================")

if __name__ == "__main__":
    seed_reviews()
