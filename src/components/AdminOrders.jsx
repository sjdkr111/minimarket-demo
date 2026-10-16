import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedOrder, setExpandedOrder] =
    useState(null);

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const [deletingOrderId, setDeletingOrderId] =
    useState(null);

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            price,
            quantity
          )
        `)
        .order("id", { ascending: false });

      if (error) {
        console.error(
          "Error fetching orders:",
          error
        );

        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    }

    fetchOrders();
  }, []);

  async function updateOrderStatus(
    orderId,
    newStatus
  ) {
    setUpdatingOrderId(orderId);

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId)
      .select()
      .single();

    setUpdatingOrderId(null);

    if (error) {
      console.error(
        "Error updating order status:",
        error
      );

      alert(
        "حدث خطأ أثناء تحديث حالة الطلب"
      );

      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: data.status,
            }
          : order
      )
    );
  }

  async function deleteOrder(order) {
    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف الطلب #${order.id} للزبون "${order.customer_name}"؟`
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingOrderId(order.id);

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    setDeletingOrderId(null);

    if (error) {
      console.error(
        "Error deleting order:",
        error
      );

      alert(
        "حدث خطأ أثناء حذف الطلب"
      );

      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter(
        (currentOrder) =>
          currentOrder.id !== order.id
      )
    );

    if (expandedOrder === order.id) {
      setExpandedOrder(null);
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString(
      "en-LB"
    );
  }

  function getStatusText(status) {
    if (status === "pending") {
      return "🟡 جديد";
    }

    if (status === "processing") {
      return "🔵 قيد التجهيز";
    }

    if (status === "completed") {
      return "🟢 مكتمل";
    }

    if (status === "cancelled") {
      return "🔴 ملغي";
    }

    return status;
  }

  function getOrdersCount(status) {
    if (status === "all") {
      return orders.length;
    }

    return orders.filter(
      (order) => order.status === status
    ).length;
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (order) => order.status === filter
        );

  return (
    <div dir="rtl" className="adminOrdersPage">

      {/* الفلاتر */}
      <div
      className="adminOrdersFilters"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          className={
            filter === "all"
              ? "adminMenuActive"
              : ""
          }
          onClick={() => setFilter("all")}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          الكل ({getOrdersCount("all")})
        </button>

        <button
          className={
            filter === "pending"
              ? "adminMenuActive"
              : ""
          }
          onClick={() =>
            setFilter("pending")
          }
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🟡 جديد (
          {getOrdersCount("pending")})
        </button>

        <button
          className={
            filter === "processing"
              ? "adminMenuActive"
              : ""
          }
          onClick={() =>
            setFilter("processing")
          }
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔵 قيد التجهيز (
          {getOrdersCount("processing")})
        </button>

        <button
          className={
            filter === "completed"
              ? "adminMenuActive"
              : ""
          }
          onClick={() =>
            setFilter("completed")
          }
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🟢 مكتمل (
          {getOrdersCount("completed")})
        </button>

        <button
          className={
            filter === "cancelled"
              ? "adminMenuActive"
              : ""
          }
          onClick={() =>
            setFilter("cancelled")
          }
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔴 ملغي (
          {getOrdersCount("cancelled")})
        </button>
      </div>

      <div className="adminTableBox">
        <div className="adminTableHeader">
          <div>
            <h2>الطلبات</h2>

            <p>
              {filter === "all"
                ? `جميع الطلبات (${filteredOrders.length})`
                : `${getStatusText(
                    filter
                  )} (${filteredOrders.length})`}
            </p>
          </div>
        </div>

        {loading ? (
          <p>جاري تحميل الطلبات...</p>
        ) : filteredOrders.length === 0 ? (
          <p>
            لا يوجد طلبات ضمن هذه الحالة.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="adminOrderCard"
              style={{
                borderBottom:
                  "1px solid #e5e7eb",
                padding: "18px 0",
              }}
            >
              <div
              className="adminOrderMain"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div
                className="adminOrderId"
                  style={{
                    minWidth: "80px",
                  }}
                >
                  <strong>
                    #{order.id}
                  </strong>
                </div>

                <div
                className="adminOrderCustomer"
                  style={{
                    flex: "1",
                    minWidth: "160px",
                  }}
                >
                  <strong>
                    {order.customer_name}
                  </strong>

                  <p
                    style={{
                      margin: "4px 0 0",
                    }}
                  >
                    📞 {order.phone}
                  </p>
                </div>

                <div
                className="adminOrderType"
                  style={{
                    minWidth: "130px",
                  }}
                >
                  {order.order_type ===
                  "delivery"
                    ? "🚚 توصيل"
                    : "🏪 استلام"}
                </div>

                <div
                className="adminOrderTotal"
                  style={{
                    minWidth: "100px",
                  }}
                >
                  <strong>
                    $
                    {Number(
                      order.total
                    ).toFixed(2)}
                  </strong>
                </div>

                <div
                className="adminOrderStatus"
                  style={{
                    minWidth: "130px",
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(
                    order.status
                  )}
                </div>

                <button
                  className="adminEditBtn adminOrderDetailsBtn"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder ===
                        order.id
                        ? null
                        : order.id
                    )
                  }
                >
                  {expandedOrder === order.id
                    ? "إخفاء"
                    : "التفاصيل"}
                </button>

                <button
                  className="adminDeleteBtn adminOrderDeleteBtn"
                  onClick={() =>
                    deleteOrder(order)
                  }
                  disabled={
                    deletingOrderId ===
                    order.id
                  }
                >
                  {deletingOrderId === order.id
                    ? "جاري الحذف..."
                    : "🗑️ حذف"}
                </button>
              </div>

              {expandedOrder ===
                order.id && (
                <div
  className="adminOrderExpanded"
  style={{
    marginTop: "18px",
    padding: "18px",
    background: "#f9fafb",
    borderRadius: "12px",
  }}
                >
                  <p>
                    <strong>
                      تاريخ الطلب:
                    </strong>{" "}
                    {formatDate(
                      order.created_at
                    )}
                  </p>

                  {order.order_type ===
                    "delivery" && (
                    <p className="adminOrderDate">
                      <strong>
                        العنوان:
                      </strong>{" "}
                      {order.address ||
                        "غير محدد"}
                    </p>
                  )}

                  <p>
                    <strong>
                      الملاحظات:
                    </strong>{" "}
                    {order.notes ||
                      "لا يوجد"}
                  </p>

                  <div
                    style={{
                      marginTop: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontWeight: "bold",
                        marginBottom: "8px",
                      }}
                    >
                      حالة الطلب
                    </label>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      disabled={
                        updatingOrderId ===
                        order.id
                      }
                      style={{
                        width: "100%",
                        maxWidth: "260px",
                        padding: "10px",
                        borderRadius: "8px",
                        border:
                          "1px solid #d1d5db",
                        background: "white",
                      }}
                    >
                      <option value="pending">
                        🟡 جديد
                      </option>

                      <option value="processing">
                        🔵 قيد التجهيز
                      </option>

                      <option value="completed">
                        🟢 مكتمل
                      </option>

                      <option value="cancelled">
                        🔴 ملغي
                      </option>
                    </select>

                    {updatingOrderId ===
                      order.id && (
                      <p
                        style={{
                          marginTop: "8px",
                          fontSize: "13px",
                        }}
                      >
                        جاري تحديث
                        الحالة...
                      </p>
                    )}
                  </div>

                  <h3
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    المنتجات
                  </h3>

                  {!order.order_items ||
                  order.order_items.length ===
                    0 ? (
                    <p>
                      لا يوجد منتجات مسجلة
                      لهذا الطلب.
                    </p>
                  ) : (
                    order.order_items.map(
                      (item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "15px",
                            padding:
                              "10px 0",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <span>
                            {
                              item.product_name
                            }{" "}
                            ×{" "}
                            {item.quantity}
                          </span>

                          <strong>
                            $
                            {(
                              Number(
                                item.price
                              ) *
                              item.quantity
                            ).toFixed(2)}
                          </strong>
                        </div>
                      )
                    )
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminOrders;