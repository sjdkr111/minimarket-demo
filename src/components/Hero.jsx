function Hero({ language }) {
  const isArabic = language === "ar";

  function goToProducts() {
    document
      .getElementById("products")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function goToOffers() {
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

  return (
    <section className="hero">
      <div className="heroContent">
        <span className="heroBadge">
          {isArabic
            ? "🚚 توصيل سريع إلى باب بيتك"
            : "🚚 Fast delivery to your door"}
        </span>

        <h1>
          {isArabic
            ? "كل حاجات البيت"
            : "Everything you need"}

          <span>
            {isArabic
              ? " بمكان واحد"
              : " in one place"}
          </span>
        </h1>

        <p>
          {isArabic
            ? "تسوّق المواد الغذائية، المشروبات، السناكات والمزيد واطلب بسهولة عبر واتساب."
            : "Shop groceries, drinks, snacks and more, and order easily through WhatsApp."}
        </p>

        <div className="heroButtons">
          <button
            className="shopBtn"
            onClick={goToProducts}
          >
            {isArabic
              ? "تسوّق الآن"
              : "Shop Now"}
          </button>

          <button
            className="offersBtn"
            onClick={goToOffers}
          >
            {isArabic
              ? "شاهد العروض"
              : "View Offers"}
          </button>
        </div>
      </div>

      <div className="heroVisual">
        <div className="groceryCircle">
          🛒
        </div>
      </div>
    </section>
  );
}

export default Hero;