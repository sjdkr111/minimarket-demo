import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Navbar({
  cartCount,
  onCartClick,
  language,
  onLanguageChange,
}) {
  const [storeName, setStoreName] =
    useState("MiniMarket");

  const [logoUrl, setLogoUrl] =
    useState("");

  const isArabic = language === "ar";

  useEffect(() => {
    async function fetchStoreSettings() {
      const { data, error } = await supabase
        .from("settings")
        .select("store_name, logo_url")
        .limit(1)
        .single();

      if (error) {
        console.error(
          "Error fetching store settings:",
          error
        );
        return;
      }

      if (data?.store_name) {
        setStoreName(data.store_name);
      }

      setLogoUrl(data?.logo_url || "");
    }

    fetchStoreSettings();
  }, []);

  function goToOffers(e) {
    e.preventDefault();

    const offersSection =
      document.getElementById("offers");

    if (offersSection) {
      offersSection.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      alert(
        isArabic
          ? "لا يوجد عروض حالياً"
          : "There are no offers right now"
      );
    }
  }

  function renderStoreName() {
    if (
      storeName.trim().toLowerCase() ===
      "minimarket"
    ) {
      return (
        <>
          <span style={{ color: "Black" }}>
            Mini
          </span>
          <span style={{ color: "#16a34a" }}>
            Market
          </span>
        </>
      );
    }

    return (
      <span style={{ color: "white" }}>
        {storeName}
      </span>
    );
  }

  return (
    <nav className="navbar">
      <div className="logo">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={storeName}
            style={{
              maxWidth: "150px",
              height: "50px",
              objectFit: "contain",
            }}
          />
        ) : (
          renderStoreName()
        )}
      </div>

      <div className="navLinks">
        <a href="#">
          {isArabic
            ? "الرئيسية"
            : "Home"}
        </a>

        <a href="#products">
          {isArabic
            ? "المنتجات"
            : "Products"}
        </a>

        <a
          href="#offers"
          onClick={goToOffers}
        >
          {isArabic
            ? "العروض"
            : "Offers"}
        </a>

        <a href="#contact">
          {isArabic
            ? "تواصل معنا"
            : "Contact Us"}
        </a>
      </div>

      <div className="navActions">
        <button
          className="languageBtn"
          onClick={onLanguageChange}
          type="button"
        >
          {isArabic ? "EN" : "AR"}
        </button>

        <button
          className="cartBtn"
          onClick={onCartClick}
          type="button"
        >
          🛒{" "}
          {isArabic
            ? `السلة (${cartCount})`
            : `Cart (${cartCount})`}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;