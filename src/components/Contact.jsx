import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Contact({ language }) {
  const [storeName, setStoreName] =
    useState("MiniMarket");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] =
    useState("");

  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    async function fetchContactInfo() {
      setLoading(true);

      const { data, error } = await supabase
        .from("settings")
        .select(
          "store_name, phone, address, whatsapp_number"
        )
        .limit(1)
        .single();

      if (error) {
        console.error(
          "Error fetching contact info:",
          error
        );

        setLoading(false);
        return;
      }

      setStoreName(
        data.store_name || "MiniMarket"
      );

      setPhone(data.phone || "");
      setAddress(data.address || "");

      setWhatsappNumber(
        data.whatsapp_number || ""
      );

      setLoading(false);
    }

    fetchContactInfo();
  }, []);

  const cleanWhatsappNumber =
    whatsappNumber.replace(/\D/g, "");

  if (loading) {
    return (
      <section
        className="contactSection"
        id="contact"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <p>
          {isArabic
            ? "جاري تحميل معلومات التواصل..."
            : "Loading contact information..."}
        </p>
      </section>
    );
  }

  return (
    <section
      className="contactSection"
      id="contact"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="sectionHeader">
        <div>
          <span>
            {isArabic
              ? "نحن هنا لخدمتك"
              : "We're here to help"}
          </span>

          <h2>
            {isArabic
              ? "تواصل معنا"
              : "Contact Us"}
          </h2>
        </div>
      </div>

      <div className="contactGrid">
        {phone && (
          <div className="contactCard">
            <span className="contactIcon">
              📞
            </span>

            <h3>
              {isArabic
                ? "رقم الهاتف"
                : "Phone Number"}
            </h3>

            <a href={`tel:${phone}`}>
              {phone}
            </a>
          </div>
        )}

        {address && (
          <div className="contactCard">
            <span className="contactIcon">
              📍
            </span>

            <h3>
              {isArabic
                ? "عنوان المتجر"
                : "Store Address"}
            </h3>

            <p>{address}</p>
          </div>
        )}

        {whatsappNumber && (
          <div className="contactCard">
            <span className="contactIcon">
              💬
            </span>

            <h3>WhatsApp</h3>

            <a
              href={`https://wa.me/${cleanWhatsappNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              {isArabic
                ? `تواصل مع ${storeName}`
                : `Chat with ${storeName}`}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default Contact;