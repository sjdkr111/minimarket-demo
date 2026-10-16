import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function EditProduct({
  product,
  onClose,
  onUpdateProduct,
}) {
  const [name, setName] = useState(
    product.name || ""
  );

  const [nameEn, setNameEn] = useState(
    product.name_en || ""
  );

  const [price, setPrice] = useState(
    product.price
  );

  const [onSale, setOnSale] = useState(
    product.on_sale ?? false
  );

  const [salePrice, setSalePrice] = useState(
    product.sale_price ?? ""
  );

  const [category, setCategory] = useState(
    product.category
  );

  // حالة ظهور المنتج في المتجر
  const [active, setActive] = useState(
    product.active ?? true
  );

  const [categories, setCategories] =
    useState([]);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // جلب الأقسام من Supabase
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        setLoadingCategories(false);
        return;
      }

      setCategories(data || []);
      setLoadingCategories(false);
    }

    fetchCategories();
  }, []);

  // رفع صورة جديدة إذا تم اختيارها
  async function uploadImage() {
    if (!image) {
      return product.image_url || null;
    }

    const fileExtension =
      image.name.split(".").pop();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    const filePath = `products/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("product-images")
        .upload(filePath, image);

    if (uploadError) {
      console.error(
        "Image upload error:",
        uploadError
      );

      throw new Error(
        "حدث خطأ أثناء رفع الصورة"
      );
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // حفظ التعديلات
  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert(
        "يرجى إدخال اسم المنتج بالعربي"
      );
      return;
    }

    if (!nameEn.trim()) {
      alert(
        "يرجى إدخال اسم المنتج بالإنكليزي"
      );
      return;
    }

    if (!price) {
      alert("يرجى إدخال سعر المنتج");
      return;
    }

    if (!category) {
      alert(
        "يرجى اختيار قسم للمنتج"
      );
      return;
    }

    if (Number(price) < 0) {
      alert(
        "السعر لا يمكن أن يكون سالبًا"
      );
      return;
    }

    if (onSale) {
      if (!salePrice) {
        alert(
          "يرجى إدخال سعر العرض"
        );
        return;
      }

      if (Number(salePrice) < 0) {
        alert(
          "سعر العرض لا يمكن أن يكون سالبًا"
        );
        return;
      }

      if (
        Number(salePrice) >= Number(price)
      ) {
        alert(
          "سعر العرض يجب أن يكون أقل من السعر العادي"
        );
        return;
      }
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      const updatedProduct = {
        id: product.id,

        name: name.trim(),

        name_en: nameEn.trim(),

        price: Number(price),

        category,

        icon: product.icon || "🛒",

        active,

        image_url: imageUrl,

        on_sale: onSale,

        sale_price: onSale
          ? Number(salePrice)
          : null,
      };

      const success =
        await onUpdateProduct(updatedProduct);

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error(error);

      alert(
        "حدث خطأ أثناء تعديل المنتج"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="addProductOverlay">
      <div
        className="addProductBox"
        dir="rtl"
      >
        <div className="addProductTop">
          <div>
            <h2>تعديل المنتج</h2>

            <p>
              عدّل معلومات المنتج بالعربي
              والإنكليزي
            </p>
          </div>

          <button
            className="closeAddProduct"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label>
              اسم المنتج بالعربي
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="مثال: عصير برتقال"
              disabled={loading}
              required
            />
          </div>

          <div className="formGroup">
            <label>
              اسم المنتج بالإنكليزي
            </label>

            <input
              type="text"
              value={nameEn}
              onChange={(e) =>
                setNameEn(e.target.value)
              }
              placeholder="Example: Orange Juice"
              disabled={loading}
              required
              dir="ltr"
            />
          </div>

          <div className="formGroup">
            <label>
              السعر العادي ($)
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              disabled={loading}
              required
            />
          </div>

          <div
            className="formGroup"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              id="editOnSale"
              checked={onSale}
              onChange={(e) => {
                const checked =
                  e.target.checked;

                setOnSale(checked);

                if (!checked) {
                  setSalePrice("");
                }
              }}
              disabled={loading}
              style={{
                width: "18px",
                height: "18px",
              }}
            />

            <label
              htmlFor="editOnSale"
              style={{
                margin: 0,
                cursor: "pointer",
              }}
            >
              🔥 تفعيل عرض على المنتج
            </label>
          </div>

          {onSale && (
            <div className="formGroup">
              <label>
                سعر العرض ($)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) =>
                  setSalePrice(
                    e.target.value
                  )
                }
                placeholder="مثال: 1.50"
                disabled={loading}
                required
              />

              <p
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                }}
              >
                يجب أن يكون سعر العرض أقل
                من السعر العادي.
              </p>
            </div>
          )}

          <div
            className="formGroup"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              id="editActive"
              checked={active}
              onChange={(e) =>
                setActive(e.target.checked)
              }
              disabled={loading}
              style={{
                width: "18px",
                height: "18px",
              }}
            />

            <label
              htmlFor="editActive"
              style={{
                margin: 0,
                cursor: "pointer",
              }}
            >
              🟢 إظهار المنتج في المتجر
            </label>
          </div>

          <div className="formGroup">
            <label>القسم</label>

            {loadingCategories ? (
              <p>
                جاري تحميل الأقسام...
              </p>
            ) : categories.length === 0 ? (
              <p>
                لا يوجد أقسام حالياً.
              </p>
            ) : (
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                disabled={loading}
              >
                {categories.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.name}
                    >
                      {item.icon || "📦"}{" "}
                      {item.name}
                      {item.name_en
                        ? ` — ${item.name_en}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          {product.image_url && (
            <div className="formGroup">
              <label>
                الصورة الحالية
              </label>

              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  border:
                    "1px solid #e5e7eb",
                  padding: "5px",
                  background: "#fff",
                }}
              />
            </div>
          )}

          <div className="formGroup">
            <label>
              تغيير صورة المنتج
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(
                  e.target.files?.[0] ||
                    null
                )
              }
              disabled={loading}
            />

            {image && (
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                }}
              >
                الصورة الجديدة:{" "}
                {image.name}
              </p>
            )}

            {!image &&
              product.image_url && (
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                  }}
                >
                  إذا لم تختر صورة جديدة،
                  ستبقى الصورة الحالية.
                </p>
              )}
          </div>

          <button
            type="submit"
            className="saveProductBtn"
            disabled={
              loading ||
              loadingCategories ||
              categories.length === 0
            }
          >
            {loading
              ? "جاري حفظ التعديلات..."
              : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;