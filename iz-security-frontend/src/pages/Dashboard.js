function Dashboard({ user }) {

  if (!user) {
    return (
      <div className="container">
        <h2 className="page-title">Dashboard</h2>
        <p className="empty-text">Please login to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="page-title">Dashboard</h2>

      <div className="info-card">

        <div className="info-section">
          <h3>👤 Account Information</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        {user.role === "admin" && (
          <div className="info-section">
            <h3>🛠 Admin Access</h3>
            <p>
              You have full access to manage products, orders, and system data.
              Please ensure responsible usage of admin privileges.
            </p>
          </div>
        )}

        {user.role !== "admin" && (
          <div className="info-section">
            <h3>🛒 Customer Access</h3>
            <p>
              You can browse products, place orders, track your purchases,
              and manage your cart from your account.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
