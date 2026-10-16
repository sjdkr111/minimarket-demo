import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AddProduct({ onClose, onAddProduct }) {
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");

  const [onSale, setOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [loadingCategories, setLoadingCategories] =
    useState(true);

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

      const categoryList = data || [];

      setCategories(categoryList);

      if (categoryList.length > 0) {
        setCategory(categoryList[0].name);
      }

      setLoadingCategories(false);
    }

    fetchCategories();
  }, []);

  // رفع صورة المنتج
  async function uploadImage() {
    if (!image) {
      return null;
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

  // إضافة المنتج
  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert("يرجى إدخال اسم المنتج بالعربي");
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
      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage();
      }

      const newProduct = {
        name: name.trim(),
        name_en: nameEn.trim(),
        price: Number(price),
        category,
        icon: "🛒",
        active: true,
        image_url: imageUrl,

        on_sale: onSale,

        sale_price: onSale
          ? Number(salePrice)
          : null,
      };

      const success =
        await onAddProduct(newProduct);

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error(error);

      alert(
        "حدث خطأ أثناء إضافة المنتج"
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
            <h2>إضافة منتج جديد</h2>
            <p>
              أدخل معلومات المنتج بالعربي
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
              placeholder="مثال: عصير برتقال"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
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
              placeholder="Example: Orange Juice"
              value={nameEn}
              onChange={(e) =>
                setNameEn(e.target.value)
              }
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
              placeholder="مثال: 1.50"
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
              id="onSale"
              checked={onSale}
              onChange={(e) => {
                setOnSale(e.target.checked);

                if (!e.target.checked) {
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
              htmlFor="onSale"
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
                placeholder="مثال: 0.99"
                value={salePrice}
                onChange={(e) =>
                  setSalePrice(
                    e.target.value
                  )
                }
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

          <div className="formGroup">
            <label>القسم</label>

            {loadingCategories ? (
              <p>
                جاري تحميل الأقسام...
              </p>
            ) : categories.length === 0 ? (
              <p>
                لا يوجد أقسام. أضف قسمًا
                أولاً من لوحة الإدارة.
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

          <div className="formGroup">
            <label>صورة المنتج</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(
                  e.target.files[0] ||
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
                الصورة المختارة:{" "}
                {image.name}
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
              ? "جاري إضافة المنتج..."
              : "+ إضافة المنتج"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;