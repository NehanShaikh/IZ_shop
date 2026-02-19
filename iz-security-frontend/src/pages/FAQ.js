function FAQ() {
  return (
    <div className="container">
      <h2 className="page-title">Frequently Asked Questions</h2>

      <div className="info-card">

        {/* DELIVERY */}
        <div className="info-section">
          <h3>📦 Where do you deliver?</h3>
          <p>
            Currently, delivery services are available only within
            Mangalore City, Karnataka.
          </p>
        </div>

        {/* OUTSIDE MANGALORE */}
        <div className="info-section">
          <h3>📍 Do you accept orders outside Mangalore?</h3>
          <p>
            Yes, orders from outside Mangalore are accepted on a
            self-pickup basis. Customers must collect their products
            directly from our Mangalore shop, as home delivery is
            currently limited to Mangalore city only.
          </p>
        </div>

        {/* INSTALLATION */}
        <div className="info-section">
          <h3>🛠️ Do you provide installation services?</h3>
          <p>
            Yes, installation services are available for selected products
            such as CCTV cameras and security systems. Installation charges
            may apply depending on the product type, installation
            requirements, and location.
          </p>
          <p>
            In some cases, free installation may be provided for bulk orders,
            special promotions, or selected products at the discretion of
            IZ Security System.
          </p>
        </div>

        {/* INSTALLATION OUTSIDE MANGALORE */}
        <div className="info-section">
          <h3>🛠️ Is installation available outside Mangalore?</h3>
          <p>
            Installation services are primarily available within Mangalore
            city. Customers outside Mangalore may contact us to check
            installation availability and applicable service charges.
          </p>
        </div>

        {/* DELIVERY TIME */}
        <div className="info-section">
          <h3>⏳ How long does delivery take?</h3>
          <p>
            Delivery usually takes 3–7 working days depending on product
            availability.
          </p>
        </div>

        {/* ORDER CANCELLATION */}
        <div className="info-section">
          <h3>❌ Can I cancel my order?</h3>
          <p>
            Customers can cancel their orders within 24 hours of placing
            the order. Cancellation requests made after 24 hours may not
            be accepted once the order is processed, shipped, or out for
            delivery.
          </p>
        </div>

        {/* REFUND */}
        <div className="info-section">
          <h3>💰 What is your refund policy?</h3>
          <p>
            If a prepaid online order is cancelled by the customer before
            delivery, only 80% of the paid amount will be refunded.
            The remaining 20% will be retained towards payment gateway,
            processing, and service charges.
          </p>
        </div>

        {/* RETURN */}
        <div className="info-section">
          <h3>🔄 Can I return a product?</h3>
          <p>
            Returns are accepted within 7 days only if the product is
            damaged, defective, or not functioning properly at the time
            of delivery. Customers must contact our support team with
            proper proof such as images or videos.
          </p>
        </div>

        {/* BULK DISCOUNT */}
        <div className="info-section">
          <h3>📦 Do you provide discounts on bulk orders?</h3>
          <p>
            Yes, additional discounts may be provided for bulk orders
            depending on the quantity of products and total order value.
            Customers are advised to contact IZ Security System before
            placing large quantity orders.
          </p>
        </div>

        {/* PAYMENT */}
        <div className="info-section">
          <h3>💳 What payment methods are available?</h3>
          <p>
            We accept UPI, Debit Card, Credit Card, Net Banking, and
            Cash on Delivery (COD) within eligible service areas.
            Online payments are processed securely through trusted
            payment gateways.
          </p>
        </div>

      </div>
    </div>
  );
}

export default FAQ;
