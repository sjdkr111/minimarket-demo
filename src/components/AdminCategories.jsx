import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  // إضافة قسم
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [icon, setIcon] = useState("");

  // تعديل قسم
  const [editingCategory, setEditingCategory] =
    useState(null);

  const [editName, setEditName] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // جلب الأقسام
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        setLoading(false);
        return;
      }

      setCategories(data || []);
      setLoading(false);
    }

    fetchCategories();
  }, []);

  // إضافة قسم
  async function addCategory(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert("أدخل اسم القسم بالعربي");
      return;
    }

    if (!nameEn.trim()) {
      alert("أدخل اسم القسم بالإنكليزي");
      return;
    }

    setAdding(true);

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: name.trim(),
          name_en: nameEn.trim(),
          icon: icon.trim() || "📦",
        },
      ])
      .select()
      .single();

    setAdding(false);

    if (error) {
      console.error(
        "Error adding category:",
        error
      );

      alert("حدث خطأ أثناء إضافة القسم");
      return;
    }

    setCategories((currentCategories) => [
      ...currentCategories,
      data,
    ]);

    setName("");
    setNameEn("");
    setIcon("");
  }

  // فتح التعديل
  function startEditing(category) {
    setEditingCategory(category);

    setEditName(category.name || "");
    setEditNameEn(category.name_en || "");
    setEditIcon(category.icon || "");
  }

  // إلغاء التعديل
  function cancelEditing() {
    setEditingCategory(null);

    setEditName("");
    setEditNameEn("");
    setEditIcon("");
  }

  // حفظ التعديل
  async function updateCategory(e) {
    e.preventDefault();

    if (!editName.trim()) {
      alert("أدخل اسم القسم بالعربي");
      return;
    }

    if (!editNameEn.trim()) {
      alert("أدخل اسم القسم بالإنكليزي");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("categories")
      .update({
        name: editName.trim(),
        name_en: editNameEn.trim(),
        icon: editIcon.trim() || "📦",
      })
      .eq("id", editingCategory.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error(
        "Error updating category:",
        error
      );

      alert("حدث خطأ أثناء تعديل القسم");
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === data.id
          ? data
          : category
      )
    );

    cancelEditing();
  }

  // حذف قسم
  async function deleteCategory(category) {
    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف قسم "${category.name}"؟`
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.error(
        "Error deleting category:",
        error
      );

      alert("حدث خطأ أثناء حذف القسم");
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.filter(
        (item) =>
          item.id !== category.id
      )
    );
  }

  return (
    <div dir="rtl">
      {/* إضافة قسم */}
      <div className="adminTableBox">
        <div className="adminTableHeader">
          <div>
            <h2>إدارة الأقسام</h2>

            <p>
              أضف وعدّل أقسام المتجر
              بالعربي والإنكليزي
            </p>
          </div>
        </div>

        <form onSubmit={addCategory}>
          <div className="formGroup">
            <label>
              اسم القسم بالعربي
            </label>

            <input
              type="text"
              placeholder="مثال: مثلجات"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              disabled={adding}
            />
          </div>

          <div className="formGroup">
            <label>
              اسم القسم بالإنكليزي
            </label>

            <input
              type="text"
              placeholder="Example: Ice Cream"
              value={nameEn}
              onChange={(e) =>
                setNameEn(e.target.value)
              }
              disabled={adding}
              dir="ltr"
            />
          </div>

          <div className="formGroup">
            <label>الأيقونة</label>

            <input
              type="text"
              placeholder="مثال: 🍦"
              value={icon}
              onChange={(e) =>
                setIcon(e.target.value)
              }
              disabled={adding}
            />
          </div>

          <button
            type="submit"
            className="addProductAdminBtn"
            disabled={adding}
          >
            {adding
              ? "جاري الإضافة..."
              : "+ إضافة قسم"}
          </button>
        </form>
      </div>

      {/* الأقسام الحالية */}
      <div
        className="adminTableBox"
        style={{
          marginTop: "20px",
        }}
      >
        <div className="adminTableHeader">
          <h2>الأقسام الحالية</h2>
        </div>

        {loading ? (
          <p>جاري تحميل الأقسام...</p>
        ) : categories.length === 0 ? (
          <p>لا يوجد أقسام بعد.</p>
        ) : (
          categories.map((category) => (
            <div
              className="adminProduct"
              key={category.id}
            >
              <span className="adminProductIcon">
                {category.icon || "📦"}
              </span>

              <div>
                <strong>
                  {category.name}
                </strong>

                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.65,
                    marginTop: "4px",
                  }}
                  dir="ltr"
                >
                  {category.name_en ||
                    "No English name"}
                </div>
              </div>

              <button
                className="adminEditBtn"
                onClick={() =>
                  startEditing(category)
                }
                type="button"
              >
                تعديل
              </button>

              <button
                className="adminDeleteBtn"
                onClick={() =>
                  deleteCategory(category)
                }
                type="button"
              >
                🗑️ حذف
              </button>
            </div>
          ))
        )}
      </div>

      {/* نافذة تعديل القسم */}
      {editingCategory && (
        <div className="addProductOverlay">
          <div
            className="addProductBox"
            dir="rtl"
          >
            <div className="addProductTop">
              <div>
                <h2>تعديل القسم</h2>

                <p>
                  عدّل الاسم العربي
                  والإنكليزي والأيقونة
                </p>
              </div>

              <button
                className="closeAddProduct"
                onClick={cancelEditing}
                type="button"
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form onSubmit={updateCategory}>
              <div className="formGroup">
                <label>
                  اسم القسم بالعربي
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                  disabled={saving}
                />
              </div>

              <div className="formGroup">
                <label>
                  اسم القسم بالإنكليزي
                </label>

                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) =>
                    setEditNameEn(
                      e.target.value
                    )
                  }
                  disabled={saving}
                  dir="ltr"
                />
              </div>

              <div className="formGroup">
                <label>الأيقونة</label>

                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) =>
                    setEditIcon(
                      e.target.value
                    )
                  }
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                className="saveProductBtn"
                disabled={saving}
              >
                {saving
                  ? "جاري الحفظ..."
                  : "حفظ التعديلات"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;