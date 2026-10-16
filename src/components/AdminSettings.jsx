import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminSettings() {
  const [settingsId, setSettingsId] = useState(null);

  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] =
    useState(true);

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error(
          "Error fetching settings:",
          error
        );

        setLoading(false);
        return;
      }

      setSettingsId(data.id);
      setStoreName(data.store_name || "");
      setWhatsappNumber(data.whatsapp_number || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setDeliveryEnabled(
        data.delivery_enabled ?? true
      );
      setLogoUrl(data.logo_url || "");

      setLoading(false);
    }

    fetchSettings();
  }, []);

  function handleLogoChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة فقط");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("حجم الصورة يجب ألا يتجاوز 5MB");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
  }

  function handleRemoveLogo() {
    setLogoUrl("");
    setLogoFile(null);
  }

  async function uploadLogo() {
    if (!logoFile) {
      return logoUrl || null;
    }

    const fileExtension =
      logoFile.name.split(".").pop() || "png";

    const fileName =
      `logo-${Date.now()}.${fileExtension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("store-assets")
        .upload(fileName, logoFile, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Error uploading logo:",
        uploadError
      );

      throw uploadError;
    }

    const { data } = supabase.storage
      .from("store-assets")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!storeName.trim()) {
      alert("يرجى إدخال اسم المتجر");
      return;
    }

    if (!whatsappNumber.trim()) {
      alert("يرجى إدخال رقم واتساب");
      return;
    }

    if (!settingsId) {
      alert("لم يتم العثور على إعدادات المتجر");
      return;
    }

    setSaving(true);

    try {
      const uploadedLogoUrl =
        await uploadLogo();

      const { data, error } = await supabase
        .from("settings")
        .update({
          store_name: storeName.trim(),
          whatsapp_number:
            whatsappNumber.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          delivery_enabled:
            deliveryEnabled,
          logo_url: uploadedLogoUrl,
        })
        .eq("id", settingsId)
        .select()
        .single();

      if (error) {
        console.error(
          "Error updating settings:",
          error
        );

        alert(
          "حدث خطأ أثناء حفظ الإعدادات"
        );
        return;
      }

      setStoreName(data.store_name || "");
      setWhatsappNumber(
        data.whatsapp_number || ""
      );
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setDeliveryEnabled(
        data.delivery_enabled ?? true
      );
      setLogoUrl(data.logo_url || "");
      setLogoFile(null);

      alert("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error(
        "Error saving store settings:",
        error
      );

      alert(
        "حدث خطأ أثناء رفع شعار المتجر"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="adminTableBox"
        dir="rtl"
      >
        <p>جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="adminTableBox">
        <div className="adminTableHeader">
          <div>
            <h2>إعدادات المتجر</h2>
            <p>
              تعديل معلومات الميني ماركت
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="formGroup">
            <label>اسم المتجر</label>

            <input
              type="text"
              value={storeName}
              onChange={(e) =>
                setStoreName(e.target.value)
              }
              placeholder="MiniMarket"
              disabled={saving}
            />
          </div>

          <div className="formGroup">
            <label>شعار المتجر</label>

            {logoUrl && (
              <div
                style={{
                  marginBottom: "12px",
                }}
              >
                <img
                  src={logoUrl}
                  alt="شعار المتجر"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "8px",
                    background: "white",
                  }}
                />

                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <button
                    type="button"
                    className="adminDeleteBtn"
                    onClick={handleRemoveLogo}
                    disabled={saving}
                  >
                    🗑️ إزالة الشعار
                  </button>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={saving}
            />

            {logoFile && (
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                }}
              >
                الصورة المختارة:{" "}
                {logoFile.name}
              </p>
            )}

            <p
              style={{
                marginTop: "6px",
                fontSize: "13px",
              }}
            >
              PNG أو JPG أو WEBP — الحد
              الأقصى 5MB
            </p>
          </div>

          <div className="formGroup">
            <label>رقم واتساب</label>

            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) =>
                setWhatsappNumber(
                  e.target.value
                )
              }
              placeholder="961..."
              disabled={saving}
            />

            <p
              style={{
                marginTop: "6px",
                fontSize: "13px",
              }}
            >
              اكتب الرقم مع رمز الدولة ومن
              دون +
            </p>
          </div>

          <div className="formGroup">
            <label>رقم الهاتف</label>

            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="رقم المتجر"
              disabled={saving}
            />
          </div>

          <div className="formGroup">
            <label>عنوان المتجر</label>

            <input
              type="text"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              placeholder="عنوان المتجر"
              disabled={saving}
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
              id="deliveryEnabled"
              checked={deliveryEnabled}
              onChange={(e) =>
                setDeliveryEnabled(
                  e.target.checked
                )
              }
              disabled={saving}
              style={{
                width: "18px",
                height: "18px",
              }}
            />

            <label
              htmlFor="deliveryEnabled"
              style={{
                margin: 0,
                cursor: "pointer",
              }}
            >
              تفعيل خدمة التوصيل 🚚
            </label>
          </div>

          <button
            type="submit"
            className="saveProductBtn"
            disabled={saving}
          >
            {saving
              ? "جاري الحفظ..."
              : "حفظ الإعدادات"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminSettings;