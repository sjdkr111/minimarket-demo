import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Footer({ language }) {
  const [settings, setSettings] = useState({
    store_name: "MiniMarket",
    phone: "",
    address: "",
    whatsapp_number: "",
    logo_url: "",
  });

  const isArabic = language === "ar";

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("settings")
        .select(
          "store_name, phone, address, whatsapp_number, logo_url"
        )
        .limit(1)
        .single();

      if (error) {
        console.error(
          "Error fetching footer settings:",
          error
        );
        return;
      }

      if (data) {
        setSettings({
          store_name:
            data.store_name || "MiniMarket",

          phone:
            data.phone || "",

          address:
            data.address || "",

          whatsapp_number:
            data.whatsapp_number || "",

          logo_url:
            data.logo_url || "",
        });
      }
    }

    fetchSettings();
  }, []);

  const cleanWhatsappNumber =
    settings.whatsapp_number.replace(
      /\D/g,
      ""
    );

  const currentYear =
    new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#111827",
        color: "#ffffff",
        marginTop: "60px",
        padding: "50px 20px 20px",
      }}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "35px",
        }}
      >
        <div>
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.store_name}
              style={{
                maxWidth: "150px",
                height: "60px",
                objectFit: "contain",
                marginBottom: "15px",
                background: "#ffffff",
                borderRadius: "10px",
                padding: "5px",
              }}
            />
          ) : (
            <h2
              style={{
                marginTop: 0,
                marginBottom: "15px",
              }}
            >
              {settings.store_name}
            </h2>
          )}

          <p
            style={{
              lineHeight: "1.8",
              opacity: 0.8,
              margin: 0,
            }}
          >
            {isArabic
              ? "كل حاجات البيت بمكان واحد. تسوّق بسهولة واطلب مباشرة عبر واتساب."
              : "Everything you need in one place. Shop easily and order directly through WhatsApp."}
          </p>
        </div>

        <div>
          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
            }}
          >
            {isArabic
              ? "روابط سريعة"
              : "Quick Links"}
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <a
              href="#"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {isArabic
                ? "الرئيسية"
                : "Home"}
            </a>

            <a
              href="#products"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {isArabic
                ? "المنتجات"
                : "Products"}
            </a>

            <a
              href="#offers"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {isArabic
                ? "العروض"
                : "Offers"}
            </a>

            <a
              href="#contact"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {isArabic
                ? "تواصل معنا"
                : "Contact Us"}
            </a>
          </div>
        </div>

        <div>
          <h3
            style={{
              marginTop: 0,
              marginBottom: "18px",
            }}
          >
            {isArabic
              ? "معلومات المتجر"
              : "Store Information"}
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              lineHeight: "1.6",
            }}
          >
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  opacity: 0.8,
                }}
              >
                📞 {settings.phone}
              </a>
            )}

            {settings.address && (
              <span
                style={{
                  opacity: 0.8,
                }}
              >
                📍 {settings.address}
              </span>
            )}

            {settings.whatsapp_number && (
              <a
                href={`https://wa.me/${cleanWhatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  opacity: 0.8,
                }}
              >
                {isArabic
                  ? "💬 تواصل عبر واتساب"
                  : "💬 Contact us on WhatsApp"}
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto 0",
          paddingTop: "20px",
          borderTop:
            "1px solid rgba(255,255,255,0.12)",
          textAlign: "center",
          fontSize: "14px",
          opacity: 0.7,
        }}
      >
        © {currentYear}{" "}
        {settings.store_name} —{" "}
        {isArabic
          ? "جميع الحقوق محفوظة"
          : "All Rights Reserved"}
      </div>
    </footer>
  );
}

export default Footer;