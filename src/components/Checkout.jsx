import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Checkout({
  cart,
  onClose,
  onOrderSuccess,
  language,
}) {
  const isArabic = language === "ar";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState("pickup");

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [storeName, setStoreName] =
    useState("MiniMarket");

  const [whatsappNumber, setWhatsappNumber] =
    useState("");

  const [deliveryEnabled, setDeliveryEnabled] =
    useState(false);

  const [loadingSettings, setLoadingSettings] =
    useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setLoadingSettings(true);

      const { data, error } = await supabase
        .from("settings")
        .select(
          "store_name, whatsapp_number, delivery_enabled"
        )
        .limit(1)
        .single();

      if (error) {
        console.error(
          "Error fetching store settings:",
          error
        );

        setLoadingSettings(false);
        return;
      }

      setStoreName(
        data.store_name || "MiniMarket"
      );

      setWhatsappNumber(
        data.whatsapp_number || ""
      );

      const isDeliveryEnabled =
        data.delivery_enabled ?? false;

      setDeliveryEnabled(
        isDeliveryEnabled
      );

      if (isDeliveryEnabled) {
        setDeliveryMethod("delivery");
      } else {
        setDeliveryMethod("pickup");
      }

      setLoadingSettings(false);
    }

    fetchSettings();
  }, []);

  const total = cart.reduce(
    (sum, product) =>
      sum +
      Number(product.price) *
        product.quantity,
    0
  );

  function getProductName(product) {
    if (isArabic) {
      return product.name;
    }

    return product.name_en || product.name;
  }

  async function sendWhatsAppOrder() {
    if (loading) {
      return;
    }

    if (loadingSettings) {
      alert(
        isArabic
          ? "يرجى الانتظار حتى يتم تحميل إعدادات المتجر"
          : "Please wait until the store settings are loaded."
      );
      return;
    }

    if (!whatsappNumber) {
      alert(
        isArabic
          ? "رقم واتساب المتجر غير محدد"
          : "The store WhatsApp number is not set."
      );
      return;
    }

    if (cart.length === 0) {
      alert(
        isArabic
          ? "السلة فارغة"
          : "Your cart is empty."
      );
      return;
    }

    if (!name.trim() || !phone.trim()) {
      alert(
        isArabic
          ? "يرجى إدخال الاسم ورقم الهاتف"
          : "Please enter your name and phone number."
      );
      return;
    }

    if (
      deliveryMethod === "delivery" &&
      !address.trim()
    ) {
      alert(
        isArabic
          ? "يرجى إدخال عنوان التوصيل"
          : "Please enter the delivery address."
      );
      return;
    }

    setLoading(true);

    try {
      const items = cart.map(
        (product) => ({
          product_id: product.id,
          product_name: product.name,
          price: Number(product.price),
          quantity: product.quantity,
        })
      );

      const {
        data: orderId,
        error: orderError,
      } = await supabase.rpc(
        "create_order_with_items",
        {
          p_customer_name: name.trim(),
          p_phone: phone.trim(),
          p_order_type:
            deliveryMethod,

          p_address:
            deliveryMethod === "delivery"
              ? address.trim()
              : null,

          p_notes:
            notes.trim() || null,

          p_total: Number(
            total.toFixed(2)
          ),

          p_items: items,
        }
      );

      if (orderError) {
        console.error(
          "Error creating order:",
          orderError
        );

        alert(
          isArabic
            ? "حدث خطأ أثناء إنشاء الطلب"
            : "An error occurred while creating your order."
        );

        return;
      }

      if (!orderId) {
        console.error(
          "Order ID was not returned"
        );

        alert(
          isArabic
            ? "لم يتم الحصول على رقم الطلب"
            : "The order number could not be generated."
        );

        return;
      }

      const productsText = cart
        .map(
          (product) =>
            `• ${getProductName(
              product
            )} × ${
              product.quantity
            } — $${(
              Number(product.price) *
              product.quantity
            ).toFixed(2)}`
        )
        .join("\n");

      const deliveryText =
        deliveryMethod === "delivery"
          ? isArabic
            ? "🚚 توصيل إلى المنزل"
            : "🚚 Home Delivery"
          : isArabic
          ? "🏪 استلام من المحل"
          : "🏪 Store Pickup";

      const message = isArabic
        ? `🛒 طلب جديد - ${storeName}

🧾 رقم الطلب: #${orderId}

👤 الاسم: ${name.trim()}
📞 رقم الهاتف: ${phone.trim()}

📦 طريقة الاستلام:
${deliveryText}

${
  deliveryMethod === "delivery"
    ? `📍 العنوان: ${address.trim()}`
    : ""
}

--------------------

🛍️ المنتجات:

${productsText}

--------------------

💰 المجموع: $${total.toFixed(2)}

📝 ملاحظات:
${notes.trim() || "لا يوجد"}`
        : `🛒 New Order - ${storeName}

🧾 Order Number: #${orderId}

👤 Name: ${name.trim()}
📞 Phone: ${phone.trim()}

📦 Order Method:
${deliveryText}

${
  deliveryMethod === "delivery"
    ? `📍 Address: ${address.trim()}`
    : ""
}

--------------------

🛍️ Products:

${productsText}

--------------------

💰 Total: $${total.toFixed(2)}

📝 Notes:
${notes.trim() || "None"}`;

      const cleanWhatsappNumber =
        whatsappNumber.replace(
          /\D/g,
          ""
        );

      const params = new URLSearchParams({
        text: message,
      });

      const whatsappUrl =
        `https://wa.me/${cleanWhatsappNumber}?${params.toString()}`;

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );

      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (error) {
      console.error(
        "Unexpected checkout error:",
        error
      );

      alert(
        isArabic
          ? "حدث خطأ غير متوقع أثناء إرسال الطلب"
          : "An unexpected error occurred while sending your order."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkoutOverlay">
      <div
        className="checkoutBox"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="checkoutTop">
          <div>
            <h2>
              {isArabic
                ? "إتمام الطلب"
                : "Checkout"}
            </h2>

            <p className="checkoutSubtitle">
              {isArabic
                ? "أدخل معلوماتك لإكمال الطلب"
                : "Enter your information to complete your order"}
            </p>
          </div>

          <button
            className="closeCheckout"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            ✕
          </button>
        </div>

        {loadingSettings ? (
          <p>
            {isArabic
              ? "جاري تحميل إعدادات المتجر..."
              : "Loading store settings..."}
          </p>
        ) : (
          <>
            <div className="formGroup">
              <label>
                {isArabic
                  ? "الاسم"
                  : "Name"}
              </label>

              <input
                type="text"
                placeholder={
                  isArabic
                    ? "اكتب اسمك"
                    : "Enter your name"
                }
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="formGroup">
              <label>
                {isArabic
                  ? "رقم الهاتف"
                  : "Phone Number"}
              </label>

              <input
                type="tel"
                placeholder={
                  isArabic
                    ? "مثال: 03 123 456"
                    : "Example: 03 123 456"
                }
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="formGroup">
              <label>
                {isArabic
                  ? "طريقة استلام الطلب"
                  : "Order Method"}
              </label>

              <div className="deliveryOptions">
                {deliveryEnabled && (
                  <button
                    type="button"
                    className={
                      deliveryMethod ===
                      "delivery"
                        ? "deliveryOption active"
                        : "deliveryOption"
                    }
                    onClick={() =>
                      setDeliveryMethod(
                        "delivery"
                      )
                    }
                    disabled={loading}
                  >
                    {isArabic
                      ? "🚚 توصيل"
                      : "🚚 Delivery"}
                  </button>
                )}

                <button
                  type="button"
                  className={
                    deliveryMethod ===
                    "pickup"
                      ? "deliveryOption active"
                      : "deliveryOption"
                  }
                  onClick={() =>
                    setDeliveryMethod(
                      "pickup"
                    )
                  }
                  disabled={loading}
                >
                  {isArabic
                    ? "🏪 استلام من المحل"
                    : "🏪 Store Pickup"}
                </button>
              </div>
            </div>

            {deliveryMethod ===
              "delivery" &&
              deliveryEnabled && (
                <div className="formGroup">
                  <label>
                    {isArabic
                      ? "عنوان التوصيل"
                      : "Delivery Address"}
                  </label>

                  <input
                    type="text"
                    placeholder={
                      isArabic
                        ? "المنطقة، الشارع، المبنى..."
                        : "Area, street, building..."
                    }
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    disabled={loading}
                  />
                </div>
              )}

            <div className="formGroup">
              <label>
                {isArabic
                  ? "ملاحظات"
                  : "Notes"}
              </label>

              <textarea
                placeholder={
                  isArabic
                    ? "أي ملاحظة على الطلب..."
                    : "Any notes about your order..."
                }
                rows="3"
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="checkoutTotal">
              <span>
                {isArabic
                  ? "المجموع"
                  : "Total"}
              </span>

              <strong>
                ${total.toFixed(2)}
              </strong>
            </div>

            <button
              className="whatsappBtn"
              onClick={sendWhatsAppOrder}
              disabled={
                loading ||
                loadingSettings ||
                !whatsappNumber
              }
            >
              {loading
                ? isArabic
                  ? "جاري تسجيل الطلب..."
                  : "Creating Order..."
                : isArabic
                ? "إرسال الطلب عبر واتساب"
                : "Send Order via WhatsApp"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;