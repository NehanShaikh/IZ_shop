function Terms() {
  return (
    <div className="container">
      <h2 className="page-title">Terms & Conditions</h2>

      <div className="info-card">

        <div className="info-section">
          <h3>💰 Refund Policy</h3>
          <p>
            Refunds are processed within 5-7 business days in case of
            cancellations due to damaged or defective products.
          </p>
          <p>
            If a prepaid online order is cancelled by the customer,
            only 80% of the paid amount will be refunded.
            The remaining 20% will be retained towards processing,
            transaction, and service charges.
          </p>
        </div>

        <div className="info-section">
          <h3>🚚 Delivery Policy</h3>
          <p>
            Delivery services are currently available only within
            Mangalore City, Karnataka.
          </p>
          <p>
            Orders are delivered within 3-7 working days depending
            on product availability.
          </p>
        </div>

        {/* 🆕 OUTSIDE MANGALORE ORDER POLICY */}
<div className="info-section">
  <h3>📍 Orders Outside Mangalore</h3>
  <p>
    Orders from locations outside Mangalore city are accepted
    only on a self-pickup basis.
  </p>
  <p>
    Customers placing orders from outside Mangalore must
    collect their products directly from our Mangalore shop.
    Home delivery is currently limited to Mangalore city only.
  </p>
</div>

        {/* 🆕 BULK ORDER DISCOUNT POLICY */}
<div className="info-section">
  <h3>📦 Bulk Order Discount Policy</h3>
  <p>
    Additional discounts may be provided for bulk orders
    based on the quantity of products placed in a single order.
    The discount eligibility and percentage will be decided
    by the admin depending on order volume and product type.
  </p>
  <p>
    Bulk discounts are applicable only after order review
    and are not automatically guaranteed for every order.
  </p>
</div>

        {/* 🆕 ORDER CANCELLATION POLICY */}
        <div className="info-section">
          <h3>❌ Order Cancellation Policy</h3>
          <p>
            Customers can cancel their orders within 24 hours of placing
            the order. Cancellation requests made after 24 hours may not
            be accepted once the order is processed, shipped, or out for delivery.
          </p>
          <p>
            Orders that are already shipped or marked as "Out for Delivery"
            cannot be cancelled. In such cases, customers may contact support
            for further assistance.
          </p>
        </div>

        <div className="info-section">
          <h3>👤 User Responsibilities</h3>
          <p>
            Users must provide accurate and complete information
            while placing orders. Any misuse of the platform,
            fraudulent activity, or false details may result in
            cancellation of orders or suspension of the account.
          </p>
        </div>

        <div className="info-section">
          <h3>💳 Payment Terms</h3>
          <p>
            We accept secure online payments through UPI, Debit Card,
            Credit Card, and Net Banking. Orders are confirmed only
            after successful payment verification in case of online payments.
          </p>
          <p>
            Cash on Delivery (COD) is available within eligible service areas.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Terms;
