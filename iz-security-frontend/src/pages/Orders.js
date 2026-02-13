import { useEffect, useState } from "react";

function Orders({ user }) {

  const [orders, setOrders] = useState([]);

  // =============================
  // FETCH ORDERS
  // =============================
  const fetchOrders = async () => {
    try {
      const res = await fetch("https://iz-shop.onrender.com/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchOrders();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="container">
        <h2 style={{ color: "#ef4444" }}>Access Denied</h2>
      </div>
    );
  }

  // =============================
  // UPDATE ORDER STATUS
  // =============================
  const updateStatus = async (id, newStatus) => {

    try {
      await fetch(`https://iz-shop.onrender.com/update-order-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      fetchOrders(); // 🔥 refresh from DB

    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="container">

      <h2 style={{ marginBottom: "30px", color: "#38bdf8" }}>
        Customer Orders
      </h2>

      {orders.length === 0 && (
        <p style={{ color: "#94a3b8" }}>No orders available.</p>
      )}

      {orders.map(order => (

        <div className="order-card" key={order.id}>

          <div className="order-header">
            <h3>Order #{order.id}</h3>
            <span className={`status-badge ${order.order_status.toLowerCase()}`}>
              {order.order_status}
            </span>
          </div>

          <div className="order-details">
            <p><strong>Name:</strong> {order.customer_name}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <div>
  <strong>Products:</strong>
  <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
    {order.products
      .split(/(?<=x\d)\s*,\s*/)
      .map((item, i) => (
        <li key={i} style={{ marginBottom: "6px" }}>
          {item.trim()}
        </li>
      ))}
  </ul>
</div>

            <p><strong>Total:</strong> ₹{order.total_amount}</p>
          </div>

          {/* 🔥 ACTION BUTTONS */}
          {order.order_status === "Pending" && (
            <div className="order-actions">

              <button
  className="button admin-cancel"
  onClick={() => updateStatus(order.id, "Cancelled")}
>
  Cancel Order
</button>

<button
  className="button admin-deliver"
  onClick={() => updateStatus(order.id, "Delivered")}
>
  Mark Delivered
</button>


            </div>
          )}

          {order.order_status === "Delivered" && (
            <p className="delivered-text">
              ✓ Order Delivered Successfully
            </p>
          )}

          {order.order_status === "Cancelled" && (
            <p className="cancelled-text">
              ✕ Order Cancelled
            </p>
          )}

        </div>
      ))}

    </div>
  );
}

export default Orders;
