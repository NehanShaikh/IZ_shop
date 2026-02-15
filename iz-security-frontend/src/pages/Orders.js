import { useEffect, useState } from "react";

function Orders({ user }) {

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  const API = "https://iz-shop.onrender.com";

  // =============================
  // FETCH ORDERS
  // =============================
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/orders`);
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
  const updateStatus = async (id, newStatus, reason = null) => {
    try {
      await fetch(`${API}/update-order-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: reason
        })
      });

      fetchOrders();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter(order => order.order_status === filter);

  return (
    <div className="container">

      <h2 style={{ marginBottom: "20px", color: "#38bdf8" }}>
        Customer Orders
      </h2>

      {/* FILTER BUTTONS */}
      <div style={{ marginBottom: "25px" }}>
        {["All", "Pending", "Delivered", "Cancelled"].map(status => (
          <button
            key={status}
            className="button"
            style={{
              marginRight: "10px",
              background:
                filter === status
                  ? "linear-gradient(90deg,#22c55e,#16a34a)"
                  : ""
            }}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <p style={{ color: "#94a3b8" }}>No orders available.</p>
      )}

      {filteredOrders.map(order => (

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
                  ?.match(/.*?x\d/g)
                  ?.map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
              </ul>
            </div>

            <p><strong>Total:</strong> ₹{order.total_amount}</p>

            {order.payment_method === "ONLINE" && (
  <p style={{ color: "#22c55e", fontWeight: "bold" }}>
    💳 Paid Online
  </p>
)}

{order.payment_method === "COD" && (
  <p style={{ color: "#facc15", fontWeight: "bold" }}>
    🚚 Cash on Delivery
  </p>
)}


            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.created_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
              })}
            </p>
          </div>

          {order.order_status === "Pending" && (
            <div className="order-actions">
              <button
                className="button delete-btn"
                onClick={() =>
                  updateStatus(
                    order.id,
                    "Cancelled",
                    "Order cancelled due to out of stock.\nIf prepaid, the amount will be refunded."
                  )
                }
              >
                Cancel Order
              </button>



              <button
                className="button"
                style={{ marginLeft: "10px" }}
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
            <div className="cancelled-text">
              ✕ Order Cancelled

              {order.cancel_reason && (
                <div
                  style={{
                  fontSize: "13px",
                  color: "#f87171",
                  marginTop: "4px",
                  whiteSpace: "pre-line"   // 🔥 IMPORTANT
                }}
              >
                {order.cancel_reason}
              </div>
            )}
            </div>
          )}

        </div>
      ))}
      

    </div>
  );
}


export default Orders;
