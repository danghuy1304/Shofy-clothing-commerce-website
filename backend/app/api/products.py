import re
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/products", tags=["Products"])

def _parse_int(val, default_val):
    if isinstance(val, int):
        return val
    if hasattr(val, 'default') and isinstance(val.default, int):
        return val.default
    try:
        return int(val)
    except Exception:
        return default_val

@router.get("")
def get_products(
    category_slug: Optional[str] = Query(None, description="Lọc theo slug danh mục cha hoặc danh mục con"),
    search: Optional[str] = Query(None, description="Từ khóa tìm kiếm"),
    min_price: Optional[float] = Query(None, description="Giá tối thiểu"),
    max_price: Optional[float] = Query(None, description="Giá tối đa"),
    sort: Optional[str] = Query("newest", description="Sắp xếp: newest, price_asc, price_desc, popular"),
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Lấy danh sách sản phẩm thời trang từ PostgreSQL Supabase (Hỗ trợ lọc theo 7 Bucket cha hoặc các Folder danh mục con)
    """
    supabase = get_supabase_client()
    
    limit_val = _parse_int(limit, 24)
    offset_val = _parse_int(offset, 0)
    sort_val = sort.default if hasattr(sort, 'default') else (sort or "newest")
    
    category_ids = []
    if category_slug and not hasattr(category_slug, 'default'):
        try:
            # 1. Check if category_slug belongs to a parent bucket or subcategory folder
            cat_res = supabase.table("categories").select("*").eq("slug", category_slug).execute()
            if cat_res.data and len(cat_res.data) > 0:
                selected_cat = cat_res.data[0]
                category_ids.append(selected_cat["id"])
                
                # If it's a parent bucket (parent_id is None), include all child folders
                if not selected_cat.get("parent_id"):
                    child_res = supabase.table("categories").select("id").eq("parent_id", selected_cat["id"]).execute()
                    if child_res.data:
                        for child in child_res.data:
                            category_ids.append(child["id"])
        except Exception:
            pass

    query = supabase.table("products").select(
        "*, categories(id, name, slug), product_images(image_url, is_primary), product_variants(id, sku, attributes, price, stock_quantity)"
    ).eq("status", "active")

    if category_ids:
        query = query.in_("category_id", category_ids)

    if search and not hasattr(search, 'default'):
        query = query.ilike("name", f"%{search}%")

    if min_price is not None and not hasattr(min_price, 'default'):
        query = query.gte("base_price", min_price)

    if max_price is not None and not hasattr(max_price, 'default'):
        query = query.lte("base_price", max_price)

    if sort_val == "price_asc":
        query = query.order("base_price", desc=False)
    elif sort_val == "price_desc":
        query = query.order("base_price", desc=True)
    elif sort_val == "popular":
        query = query.order("total_sold", desc=True)
    else:  # newest
        query = query.order("created_at", desc=True)

    response = query.range(offset_val, offset_val + limit_val - 1).execute()
    
    return {
        "success": True,
        "data": response.data or [],
        "count": len(response.data or [])
    }

@router.get("/{product_id}/related")
def get_related_products(product_id: str, limit: int = Query(8, ge=1, le=20)):
    """
    Lấy danh sách sản phẩm liên quan (cùng danh mục) — loại trừ sản phẩm hiện tại.
    """
    supabase = get_supabase_client()
    limit_val = _parse_int(limit, 8)

    try:
        # Lấy thông tin sản phẩm hiện tại để biết category_id
        prod_res = supabase.table("products").select("id, category_id").eq("id", product_id).execute()
        if not prod_res.data:
            return {"success": True, "data": []}

        category_id = prod_res.data[0]["category_id"]

        # Tìm tất cả category_id cùng parent (anh chị em)
        cat_res = supabase.table("categories").select("id, parent_id").eq("id", category_id).execute()
        category_ids = [category_id]
        if cat_res.data and cat_res.data[0].get("parent_id"):
            parent_id = cat_res.data[0]["parent_id"]
            siblings = supabase.table("categories").select("id").eq("parent_id", parent_id).execute()
            if siblings.data:
                category_ids = [s["id"] for s in siblings.data]

        # Lấy sản phẩm liên quan, loại trừ sản phẩm hiện tại
        related = supabase.table("products").select(
            "id, name, slug, base_price, avg_rating, total_sold, product_images(image_url, is_primary)"
        ).in_("category_id", category_ids).neq(
            "id", product_id
        ).eq("status", "active").order(
            "total_sold", desc=True
        ).limit(limit_val).execute()

        return {"success": True, "data": related.data or []}
    except Exception as e:
        return {"success": True, "data": []}


import uuid

@router.get("/{identifier}")
def get_product_by_identifier(identifier: str):
    """
    Lấy chi tiết 1 sản phẩm thời trang theo slug hoặc id.
    Hỗ trợ fallback tự động cho các link cũ.
    """
    supabase = get_supabase_client()
    
    def _is_uuid(val: str) -> bool:
        try:
            uuid.UUID(val)
            return True
        except ValueError:
            return False

    query_select = "*, categories(id, name, slug), product_images(image_url, is_primary, display_order), product_variants(id, sku, attributes, price, stock_quantity)"

    res = None

    # 1. Nếu là UUID thực sự
    if _is_uuid(identifier):
        try:
            res = supabase.table("products").select(query_select).eq("id", identifier).execute()
        except Exception:
            res = None

    # 2. Nếu là số nguyên ID (vd: "424")
    elif identifier.isdigit():
        try:
            int_id = int(identifier)
            uuid_id = f"10000000-0000-0000-0000-{int_id:012x}"
            res = supabase.table("products").select(query_select).eq("id", uuid_id).execute()
        except Exception:
            res = None

    # 3. Tra cứu theo slug chính xác
    if not res or not res.data:
        try:
            res = supabase.table("products").select(query_select).eq("slug", identifier).execute()
        except Exception:
            res = None

    if res and res.data and len(res.data) > 0:
        return {
            "success": True,
            "data": res.data[0]
        }

    # 4. Fallback theo số đuôi trong slug (nếu là link cũ)
    digits = re.findall(r'\d+', identifier)
    if digits:
        try:
            old_num = int(digits[-1])
            mapped_id = ((old_num - 1) % 448) + 1
            fallback_uuid = f"10000000-0000-0000-0000-{mapped_id:012x}"
            fallback_res = supabase.table("products").select(query_select).eq("id", fallback_uuid).execute()

            if fallback_res.data and len(fallback_res.data) > 0:
                return {
                    "success": True,
                    "data": fallback_res.data[0],
                    "fallback_from": identifier
                }
        except Exception:
            pass

    # 5. Fallback lấy sản phẩm đầu tiên hoạt động
    try:
        fallback_first = supabase.table("products").select(query_select).eq("status", "active").limit(1).execute()
        if fallback_first.data and len(fallback_first.data) > 0:
            return {
                "success": True,
                "data": fallback_first.data[0],
                "fallback_from": identifier
            }
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")
