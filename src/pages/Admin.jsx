import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddProduct from "../components/AddProduct";
import EditProduct from "../components/EditProduct";
import AdminCategories from "../components/AdminCategories";
import AdminOrders from "../components/AdminOrders";
import AdminSettings from "../components/AdminSettings";

import { supabase } from "../lib/supabase";

function Admin() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [isAddProductOpen, setIsAddProductOpen] =
    useState(false);

  const [productToEdit, setProductToEdit] =
    useState(null);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [categoriesCount, setCategoriesCount] =
    useState(0);

  const [ordersCount, setOrdersCount] =
    useState(0);

  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error(
          "Error fetching products:",
          error
        );

        setLoadingProducts(false);
        return;
      }

      setProducts(data || []);
      setLoadingProducts(false);
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchCategoriesCount() {
      const { count, error } = await supabase
        .from("categories")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (error) {
        console.error(
          "Error fetching categories count:",
          error
        );
        return;
      }

      setCategoriesCount(count || 0);
    }

    fetchCategoriesCount();
  }, [activeSection]);

  useEffect(() => {
    async function fetchOrdersCount() {
      const { count, error } = await supabase
        .from("orders")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (error) {
        console.error(
          "Error fetching orders count:",
          error
        );
        return;
      }

      setOrdersCount(count || 0);
    }

    fetchOrdersCount();
  }, [activeSection]);

  async function addProduct(product) {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error(
        "Error adding product:",
        error
      );

      alert("حدث خطأ أثناء إضافة المنتج");
      return false;
    }

    setProducts((currentProducts) => [
      data,
      ...currentProducts,
    ]);

    return true;
  }

  async function updateProduct(updatedProduct) {
    const { id, ...productData } =
      updatedProduct;

    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating product:",
        error
      );

      alert("حدث خطأ أثناء تعديل المنتج");
      return false;
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? data
          : product
      )
    );

    return true;
  }

  async function deleteProduct(product) {
    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف "${product.name}"؟`
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(
        "Error deleting product:",
        error
      );

      alert("حدث خطأ أثناء حذف المنتج");
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (item) => item.id !== product.id
      )
    );
  }

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      alert(
        "حدث خطأ أثناء تسجيل الخروج"
      );

      return;
    }

    navigate("/admin/login", {
      replace: true,
    });
  }

  return (
    <div
      className="adminPage"
      dir="rtl"
    >
      <aside className="adminSidebar">
        <div className="adminLogo">
          Mini<span>Market</span>
        </div>

        <p className="adminLabel">
          لوحة الإدارة
        </p>

        <nav className="adminMenu">
          <button
            className={
              activeSection === "dashboard"
                ? "adminMenuActive"
                : ""
            }
            onClick={() =>
              setActiveSection("dashboard")
            }
          >
            📊 الرئيسية
          </button>

          <button
            className={
              activeSection === "products"
                ? "adminMenuActive"
                : ""
            }
            onClick={() =>
              setActiveSection("products")
            }
          >
            📦 المنتجات
          </button>

          <button
            className={
              activeSection === "categories"
                ? "adminMenuActive"
                : ""
            }
            onClick={() =>
              setActiveSection("categories")
            }
          >
            🗂️ الأقسام
          </button>

          <button
            className={
              activeSection === "orders"
                ? "adminMenuActive"
                : ""
            }
            onClick={() =>
              setActiveSection("orders")
            }
          >
            🛒 الطلبات
          </button>

          <button
            className={
              activeSection === "settings"
                ? "adminMenuActive"
                : ""
            }
            onClick={() =>
              setActiveSection("settings")
            }
          >
            ⚙️ الإعدادات
          </button>

          <button onClick={handleLogout}>
            🚪 تسجيل الخروج
          </button>
        </nav>
      </aside>

      <main className="adminContent">

        {activeSection === "dashboard" && (
          <>
            <div className="adminHeader">
              <div>
                <h1>لوحة الإدارة</h1>
                <p>إدارة الميني ماركت</p>
              </div>

              <button
                className="addProductAdminBtn"
                onClick={() =>
                  setIsAddProductOpen(true)
                }
              >
                + إضافة منتج
              </button>
            </div>

            <div className="adminStats">
              <div className="statCard">
                <span>📦</span>

                <div>
                  <p>المنتجات</p>
                  <strong>
                    {products.length}
                  </strong>
                </div>
              </div>

              <div className="statCard">
                <span>🛒</span>

                <div>
                  <p>الطلبات</p>
                  <strong>
                    {ordersCount}
                  </strong>
                </div>
              </div>

              <div className="statCard">
                <span>🗂️</span>

                <div>
                  <p>الأقسام</p>
                  <strong>
                    {categoriesCount}
                  </strong>
                </div>
              </div>
            </div>

            <div className="adminTableBox">
              <div className="adminTableHeader">
                <h2>المنتجات</h2>

                <button
                  onClick={() =>
                    setActiveSection("products")
                  }
                >
                  عرض الكل
                </button>
              </div>

              {loadingProducts ? (
                <p>
                  جاري تحميل المنتجات...
                </p>
              ) : products.length === 0 ? (
                <p>
                  لا يوجد منتجات بعد.
                </p>
              ) : (
                products.map((product) => (
                  <div
                    className="adminProduct"
                    key={product.id}
                  >
                    <span className="adminProductIcon">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        product.icon || "🛒"
                      )}
                    </span>

                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <p>
                        {product.category}
                      </p>
                    </div>

                    <span className="adminPrice">
                      $
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </span>

                    <button
                      className="adminEditBtn"
                      onClick={() =>
                        setProductToEdit(
                          product
                        )
                      }
                    >
                      تعديل
                    </button>

                    <button
                      className="adminDeleteBtn"
                      onClick={() =>
                        deleteProduct(product)
                      }
                    >
                      🗑️ حذف
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeSection === "products" && (
          <>
            <div className="adminHeader">
              <div>
                <h1>المنتجات</h1>
                <p>
                  إدارة منتجات المتجر
                </p>
              </div>

              <button
                className="addProductAdminBtn"
                onClick={() =>
                  setIsAddProductOpen(true)
                }
              >
                + إضافة منتج
              </button>
            </div>

            <div className="adminTableBox">
              {loadingProducts ? (
                <p>
                  جاري تحميل المنتجات...
                </p>
              ) : products.length === 0 ? (
                <p>
                  لا يوجد منتجات بعد.
                </p>
              ) : (
                products.map((product) => (
                  <div
                    className="adminProduct"
                    key={product.id}
                  >
                    <span className="adminProductIcon">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        product.icon || "🛒"
                      )}
                    </span>

                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <p>
                        {product.category}
                      </p>
                    </div>

                    <span className="adminPrice">
                      $
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </span>

                    <button
                      className="adminEditBtn"
                      onClick={() =>
                        setProductToEdit(
                          product
                        )
                      }
                    >
                      تعديل
                    </button>

                    <button
                      className="adminDeleteBtn"
                      onClick={() =>
                        deleteProduct(product)
                      }
                    >
                      🗑️ حذف
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeSection === "categories" && (
          <>
            <div className="adminHeader">
              <div>
                <h1>الأقسام</h1>
                <p>
                  إدارة أقسام المتجر
                </p>
              </div>
            </div>

            <AdminCategories />
          </>
        )}

        {activeSection === "orders" && (
          <>
            <div className="adminHeader">
              <div>
                <h1>الطلبات</h1>
                <p>
                  إدارة طلبات الزبائن
                </p>
              </div>
            </div>

            <AdminOrders />
          </>
        )}

        {activeSection === "settings" && (
          <>
            <div className="adminHeader">
              <div>
                <h1>الإعدادات</h1>
                <p>
                  إعدادات ومعلومات المتجر
                </p>
              </div>
            </div>

            <AdminSettings />
          </>
        )}

      </main>

      {isAddProductOpen && (
        <AddProduct
          onClose={() =>
            setIsAddProductOpen(false)
          }
          onAddProduct={addProduct}
        />
      )}

      {productToEdit && (
        <EditProduct
          product={productToEdit}
          onClose={() =>
            setProductToEdit(null)
          }
          onUpdateProduct={
            updateProduct
          }
        />
      )}
    </div>
  );
}

export default Admin;