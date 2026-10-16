import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Offers({
  addToCart,
  language,
}) {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [
        offersResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .eq("on_sale", true)
          .not("sale_price", "is", null)
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

      if (offersResult.error) {
        console.error(
          "Error fetching offers:",
          offersResult.error
        );
      }

      if (categoriesResult.error) {
        console.error(
          "Error fetching categories:",
          categoriesResult.error
        );
      }

      setOffers(
        offersResult.data || []
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

  function getCategoryName(
    categoryName
  ) {
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
    addToCart({
      ...product,

      original_price: Number(
        product.price
      ),

      price: Number(
        product.sale_price
      ),
    });
  }

  if (loading) {
    return (
      <section
        className="products"
        id="offers"
      >
        <p>
          {isArabic
            ? "جاري تحميل العروض..."
            : "Loading offers..."}
        </p>
      </section>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <section
      className="products"
      id="offers"
    >
      <div className="sectionHeader">
        <div>
          <span>
            {isArabic
              ? "وفر أكثر 🔥"
              : "Save More 🔥"}
          </span>

          <h2>
            {isArabic
              ? "العروض الخاصة"
              : "Special Offers"}
          </h2>
        </div>
      </div>

      <div className="productsGrid">
        {offers.map((product) => (
          <div
            className="productCard"
            key={product.id}
            style={{
              position: "relative",
            }}
          >
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

            <div className="productImage">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={getProductName(
                    product
                  )}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span>
                  {product.icon || "🛒"}
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
                {getProductName(product)}
              </h3>

              <div className="productBottom">
                <div>
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
        ))}
      </div>
    </section>
  );
}

export default Offers;