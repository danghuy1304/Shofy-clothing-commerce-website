from fastapi import APIRouter
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("")
def get_categories():
    """
    Lấy danh sách 7 Nhóm Danh mục chính (tương ứng với 7 Bucket) 
    và các danh mục con (tương ứng với các Folder bên trong).
    """
    supabase = get_supabase_client()
    cat_res = supabase.table("categories").select("*").order("name", desc=False).execute()
    all_cats = cat_res.data or []

    # Map image URLs for subcategories from products
    prod_res = supabase.table("products").select("category_id, product_images(image_url)").execute()
    prod_data = prod_res.data or []

    cat_img_map = {}
    for p in prod_data:
        cid = p.get("category_id")
        imgs = p.get("product_images") or []
        if cid and imgs and len(imgs) > 0 and cid not in cat_img_map:
            cat_img_map[cid] = imgs[0].get("image_url")

    # Group into 7 Parent Buckets and their Sub-Folders
    parents = [c for c in all_cats if not c.get("parent_id")]
    children = [c for c in all_cats if c.get("parent_id")]

    # Attach images to children
    for child in children:
        cid = child.get("id")
        if not child.get("image_url") and cid in cat_img_map:
            child["image_url"] = cat_img_map[cid]

    # Attach children to parents
    result_tree = []
    for parent in parents:
        pid = parent.get("id")
        sub_folders = [c for c in children if c.get("parent_id") == pid]
        
        # Representative image for parent from first child
        parent_img = parent.get("image_url")
        if not parent_img and sub_folders and sub_folders[0].get("image_url"):
            parent_img = sub_folders[0].get("image_url")
        
        result_tree.append({
            "id": parent.get("id"),
            "name": parent.get("name"),
            "slug": parent.get("slug"),
            "image_url": parent_img,
            "children": sub_folders
        })

    return {
        "success": True,
        "data": result_tree,
        "flat": all_cats
    }
