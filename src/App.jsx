import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/categories";
import Offers from "./components/Offers";
import Products from "./components/Products";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ProtectedAdmin from "./components/ProtectedAdmin";

import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

import { supabase } from "./lib/supabase";

function Store() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [language, setLanguage] =
    useState("ar");

  useEffect(() => {
    async function testSupabase() {
      const { data, error } = await supabase
        .from("products")
        .select("*");

      console.log(
        "Supabase products:",
        data
      );

      console.log(
        "Supabase error:",
        error
      );
    }

    testSupabase();
  }, []);

  function toggleLanguage() {
    setLanguage((currentLanguage) =>
      currentLanguage === "ar"
        ? "en"
        : "ar"
    );
  }

  function addToCart(product) {
    setCart((currentCart) => {
      const existingProduct =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existingProduct) {
        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== productId
      )
    );
  }

  function handleOrderSuccess() {
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  }

  function handleSearch(value) {
    setSearchTerm(value);

    if (value.trim()) {
      setSelectedCategory("all");
    }
  }

  function showAllProducts() {
    setSelectedCategory("all");
    setSearchTerm("");
  }

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const isArabic =
    language === "ar";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
    >
      <Navbar
        cartCount={cartCount}
        onCartClick={() =>
          setIsCartOpen(!isCartOpen)
        }
        language={language}
        onLanguageChange={
          toggleLanguage
        }
      />

      <Hero language={language} />

      <section
        style={{
          maxWidth: "1200px",
          margin: "30px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              handleSearch(
                e.target.value
              )
            }
            placeholder={
              isArabic
                ? "🔎 ابحث عن منتج..."
                : "🔎 Search for a product..."
            }
            style={{
              width: "100%",
              padding: isArabic
                ? "16px 50px 16px 18px"
                : "16px 18px 16px 50px",
              border:
                "1px solid #d1d5db",
              borderRadius: "14px",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
              background: "#fff",
            }}
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label={
                isArabic
                  ? "مسح البحث"
                  : "Clear search"
              }
              style={{
                position: "absolute",
                [isArabic
                  ? "left"
                  : "right"]: "15px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                border: "none",
                background:
                  "transparent",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </section>

      <Categories
        selectedCategory={
          selectedCategory
        }
        onSelectCategory={
          setSelectedCategory
        }
        language={language}
      />

      <Offers
        addToCart={addToCart}
        language={language}
      />

      <Products
        addToCart={addToCart}
        selectedCategory={
          selectedCategory
        }
        searchTerm={searchTerm}
        onShowAll={showAllProducts}
        language={language}
      />

      <Contact
        language={language}
      />

      <Footer
        language={language}
      />

      {isCartOpen && (
        <Cart
          cart={cart}
          increaseQuantity={
            increaseQuantity
          }
          decreaseQuantity={
            decreaseQuantity
          }
          removeFromCart={
            removeFromCart
          }
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          language={language}
        />
      )}

      {isCheckoutOpen && (
        <Checkout
          cart={cart}
          onClose={() =>
            setIsCheckoutOpen(false)
          }
          onOrderSuccess={
            handleOrderSuccess
          }
          language={language}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Store />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <Admin />
            </ProtectedAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;