function PrivacyPolicy() {
  return (
    <div className="container">
      <h2 className="page-title">Privacy Policy</h2>

      <div className="info-card">

        <div className="info-section">
          <h3>📊 Data Collection</h3>
          <p>
            We collect basic customer information such as name, email address,
            phone number, and delivery address for order processing,
            account management, and customer support.
          </p>
        </div>

        <div className="info-section">
          <h3>🔐 Account & Login Information</h3>
          <p>
            User login and authentication are securely managed through
            trusted authentication services. We do not store passwords
            directly on our servers.
          </p>
        </div>

        <div className="info-section">
          <h3>💳 Payment Information</h3>
          <p>
            All online payments are processed securely through trusted
            third-party payment gateways. We do not store or have access
            to your card, UPI, or banking details.
          </p>
        </div>

        <div className="info-section">
          <h3>📦 Order & Delivery Data</h3>
          <p>
            Customer information is used only for order processing,
            delivery coordination, installation services, and
            customer communication related to orders.
          </p>
        </div>

        <div className="info-section">
          <h3>🍪 Cookies Usage</h3>
          <p>
            Our website may use cookies to enhance user experience,
            maintain login sessions, and improve website performance.
          </p>
        </div>

        <div className="info-section">
          <h3>🤝 Third-Party Services</h3>
          <p>
            We use trusted third-party services such as payment gateways,
            cloud storage, and email services to operate our platform.
            These services follow their own privacy and security standards.
          </p>
        </div>

        <div className="info-section">
          <h3>🔒 Data Protection</h3>
          <p>
            We do not sell, rent, or share your personal information with
            unauthorized third parties. All data is handled securely and
            used only for business and service purposes.
          </p>
        </div>

        <div className="info-section">
          <h3>📞 Contact & Support</h3>
          <p>
            If you contact us through forms, email, or phone, your details
            will be used only for responding to your queries and providing
            customer support.
          </p>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicy;
