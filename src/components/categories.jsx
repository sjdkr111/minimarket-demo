import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Categories({
  selectedCategory,
  onSelectCategory,
  language,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

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

  function selectCategory(categoryName) {
    onSelectCategory(categoryName);

    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 50);
  }

  function getCategoryName(category) {
    if (isArabic) {
      return category.name;
    }

    return category.name_en || category.name;
  }

  return (
    <section className="categories">
      <div className="sectionHeader">
        <div>
          <span>
            {isArabic
              ? "تسوّق حسب القسم"
              : "Shop by category"}
          </span>

          <h2>
            {isArabic
              ? "أقسام الميني ماركت"
              : "Store Categories"}
          </h2>
        </div>

        <button
          className="viewAllBtn"
          onClick={() =>
            selectCategory("all")
          }
        >
          {isArabic
            ? "عرض الكل ←"
            : "View All →"}
        </button>
      </div>

      {loading ? (
        <p>
          {isArabic
            ? "جاري تحميل الأقسام..."
            : "Loading categories..."}
        </p>
      ) : categories.length === 0 ? (
        <p>
          {isArabic
            ? "لا يوجد أقسام حالياً."
            : "No categories available."}
        </p>
      ) : (
        <div className="categoriesGrid">
          {categories.map((category) => (
            <div
              className="categoryCard"
              key={category.id}
              onClick={() =>
                selectCategory(category.name)
              }
              style={{
                cursor: "pointer",
                outline:
                  selectedCategory ===
                  category.name
                    ? "2px solid currentColor"
                    : "none",
              }}
            >
              <div className="categoryIcon">
                {category.icon || "📦"}
              </div>

              <h3>
                {getCategoryName(category)}
              </h3>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Categories;