import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Products({
  addToCart,
  selectedCategory = "all",
  searchTerm = "",
  onShowAll,
  language,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [
        productsResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .order("id", {
            ascending: false,
          }),

        supabase
          .from("categories")
          .select("*")
          .order("id", {
            ascending: true,
          }),
      ]);

      if (productsResult.error) {
        console.error(
          "Error fetching products:",
          productsResult.error
        );
      }

      if (categoriesResult.error) {
        console.error(
          "Error fetching categories:",
          categoriesResult.error
        );
      }

      setProducts(
        productsResult.data || []
      );

      setCategories(
        categoriesResult.data || []
      );

      setLoading(false);
    }

    fetchData();
  }, []);

  function getProductName(product) {
    if (isArabic) {
      return product.name;
    }

    return product.name_en || product.name;
  }

  function getCategoryName(categoryName) {
    const foundCategory =
      categories.find(
        (item) =>
          item.name === categoryName
      );

    if (!foundCategory) {
      return categoryName;
    }

    if (isArabic) {
      return foundCategory.name;
    }

    return (
      foundCategory.name_en ||
      foundCategory.name
    );
  }

  function handleAddToCart(product) {
    const hasSale =
      product.on_sale &&
      product.sale_price !== null;

    const finalPrice = hasSale
      ? Number(product.sale_price)
      : Number(product.price);

    addToCart({
      ...product,
      original_price: Number(
        product.price
      ),
      price: finalPrice,
    });
  }

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();

  const filteredProducts =
    products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category ===
          selectedCategory;

      const arabicName =
        product.name
          ?.toLowerCase() || "";

      const englishName =
        product.name_en
          ?.toLowerCase() || "";

      const categoryArabic =
        product.category
          ?.toLowerCase() || "";

      const categoryEnglish =
        getCategoryName(
          product.category
        )
          ?.toLowerCase() || "";

      const matchesSearch =
        normalizedSearch === "" ||
        arabicName.includes(
          normalizedSearch
        ) ||
        englishName.includes(
          normalizedSearch
        ) ||
        categoryArabic.includes(
          normalizedSearch
        ) ||
        categoryEnglish.includes(
          normalizedSearch
        );

      return (
        matchesCategory &&
        matchesSearch
      );
    });

  return (
    <section
      className="products"
      id="products"
    >
      <div className="sectionHeader">
        <div>
          <span>
            {searchTerm
              ? isArabic
                ? "نتائج البحث"
                : "Search Results"
              : selectedCategory === "all"
              ? isArabic
                ? "مختارات من المتجر"
                : "Store Picks"
              : isArabic
              ? "تسوّق حسب القسم"
              : "Shop by Category"}
          </span>

          <h2>
            {searchTerm
              ? isArabic
                ? `البحث عن "${searchTerm}"`
                : `Search for "${searchTerm}"`
              : selectedCategory === "all"
              ? isArabic
                ? "المنتجات الأكثر طلبًا"
                : "Popular Products"
              : getCategoryName(
                  selectedCategory
                )}
          </h2>
        </div>

        {selectedCategory !== "all" &&
        !searchTerm ? (
          <button
            type="button"
            className="viewAllBtn"
            onClick={onShowAll}
          >
            {isArabic
              ? "عرض كل المنتجات ←"
              : "View All Products →"}
          </button>
        ) : (
          searchTerm && (
            <span
              style={{
                fontSize: "14px",
                opacity: 0.7,
              }}
            >
              {filteredProducts.length}{" "}
              {isArabic
                ? "منتج"
                : "products"}
            </span>
          )
        )}
      </div>

      {loading ? (
        <p>
          {isArabic
            ? "جاري تحميل المنتجات..."
            : "Loading products..."}
        </p>
      ) : filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "35px 15px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            🔎
          </div>

          <h3>
            {isArabic
              ? "لم نجد منتجات"
              : "No products found"}
          </h3>

          <p>
            {searchTerm
              ? isArabic
                ? `لا توجد نتائج للبحث عن "${searchTerm}".`
                : `No results found for "${searchTerm}".`
              : isArabic
              ? "لا يوجد منتجات في هذا القسم حالياً."
              : "There are no products in this category right now."}
          </p>

          {selectedCategory !== "all" &&
            !searchTerm && (
              <button
                type="button"
                className="viewAllBtn"
                onClick={onShowAll}
                style={{
                  marginTop: "15px",
                }}
              >
                {isArabic
                  ? "عرض كل المنتجات"
                  : "View All Products"}
              </button>
            )}
        </div>
      ) : (
        <div className="productsGrid">
          {filteredProducts.map(
            (product) => {
              const hasSale =
                product.on_sale &&
                product.sale_price !==
                  null;

              return (
                <div
                  className="productCard"
                  key={product.id}
                  style={{
                    position: "relative",
                  }}
                >
                  {hasSale && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "#ef4444",
                        color: "white",
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        zIndex: 2,
                      }}
                    >
                      🔥{" "}
                      {isArabic
                        ? "عرض"
                        : "Sale"}
                    </div>
                  )}

                  <div className="productImage">
                    {product.image_url ? (
                      <img
                        src={
                          product.image_url
                        }
                        alt={getProductName(
                          product
                        )}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "contain",
                        }}
                      />
                    ) : (
                      <span>
                        {product.icon ||
                          "🛒"}
                      </span>
                    )}
                  </div>

                  <div className="productInfo">
                    <small>
                      {getCategoryName(
                        product.category
                      )}
                    </small>

                    <h3>
                      {getProductName(
                        product
                      )}
                    </h3>

                    <div className="productBottom">
                      <div>
                        {hasSale ? (
                          <>
                            <span
                              style={{
                                textDecoration:
                                  "line-through",
                                opacity: 0.55,
                                marginLeft: "8px",
                                fontSize: "14px",
                              }}
                            >
                              $
                              {Number(
                                product.price
                              ).toFixed(2)}
                            </span>

                            <strong
                              style={{
                                fontSize: "20px",
                              }}
                            >
                              $
                              {Number(
                                product.sale_price
                              ).toFixed(2)}
                            </strong>
                          </>
                        ) : (
                          <strong>
                            $
                            {Number(
                              product.price
                            ).toFixed(2)}
                          </strong>
                        )}
                      </div>

                      <button
                        className="addCartBtn"
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                      >
                        {isArabic
                          ? "+ أضف للسلة"
                          : "+ Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

export default Products;