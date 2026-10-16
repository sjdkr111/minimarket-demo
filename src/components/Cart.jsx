function Cart({
  cart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  onCheckout,
  language,
}) {
  const isArabic = language === "ar";

  const total = cart.reduce(
    (sum, product) =>
      sum +
      Number(product.price) *
        product.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, product) =>
      sum + product.quantity,
    0
  );

  function getProductName(product) {
    if (isArabic) {
      return product.name;
    }

    return product.name_en || product.name;
  }

  return (
    <div
      className="cartPanel"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="cartHeader">
        <h2>
          {isArabic
            ? "سلة المشتريات 🛒"
            : "Shopping Cart 🛒"}
        </h2>

        <span>
          {totalItems}{" "}
          {isArabic ? "منتجات" : "items"}
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="emptyCart">
          <p>
            {isArabic
              ? "السلة فارغة"
              : "Your cart is empty"}
          </p>

          <span>
            {isArabic
              ? "أضف بعض المنتجات أولاً"
              : "Add some products first"}
          </span>
        </div>
      ) : (
        <>
          <div className="cartItems">
            {cart.map((product) => (
              <div
                className="cartItem"
                key={product.id}
              >
                <div className="cartItemIcon">
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
                    product.icon || "🛒"
                  )}
                </div>

                <div className="cartItemDetails">
                  <h3>
                    {getProductName(product)}
                  </h3>

                  <p>
                    $
                    {(
                      Number(product.price) *
                      product.quantity
                    ).toFixed(2)}
                  </p>

                  <div className="quantityControls">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          product.id
                        )
                      }
                      aria-label={
                        isArabic
                          ? "تقليل الكمية"
                          : "Decrease quantity"
                      }
                    >
                      −
                    </button>

                    <span>
                      {product.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(
                          product.id
                        )
                      }
                      aria-label={
                        isArabic
                          ? "زيادة الكمية"
                          : "Increase quantity"
                      }
                    >
                      +
                    </button>

                    <button
                      type="button"
                      className="deleteBtn"
                      onClick={() =>
                        removeFromCart(
                          product.id
                        )
                      }
                      aria-label={
                        isArabic
                          ? "حذف المنتج"
                          : "Remove product"
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cartTotal">
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
            className="checkoutBtn"
            onClick={onCheckout}
            type="button"
          >
            {isArabic
              ? "متابعة الطلب"
              : "Continue to Checkout"}
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;