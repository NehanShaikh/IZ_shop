import { useEffect, useState } from "react";

function Orders({ user }) {

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  // 🔥 Cancel Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReasonType, setCancelReasonType] = useState("");
  const [customReason, setCustomReason] = useState("");

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

      let bodyData = {
        status: newStatus,
        reason: reason
      };

      // 🔥 Ask OTP when marking Delivered
      if (newStatus === "Delivered") {
        const enteredOtp = prompt("Enter Delivery OTP:");
        if (!enteredOtp) return;
        bodyData.enteredOtp = enteredOtp;
      }

      const res = await fetch(`${API}/update-order-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

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
        {[
          "All",
          "Pending",
          "Shipped",
          "Out for Delivery",
          "Delivered",
          "Cancelled"
        ].map(status => (
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

            <span
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold",
                color: "white",
                backgroundColor:
                  order.order_status === "Pending"
                    ? "#facc15"
                    : order.order_status === "Shipped"
                    ? "#3b82f6"
                    : order.order_status === "Out for Delivery"
                    ? "#f97316"
                    : order.order_status === "Delivered"
                    ? "#22c55e"
                    : "#ef4444"
              }}
            >
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

            {/* 🔥 SHOW OTP INSIDE ORDER */}
            {order.order_status === "Out for Delivery" && order.delivery_otp && (
              <div style={{
                marginTop: "10px",
                padding: "10px",
                background: "#0f172a",
                borderRadius: "6px",
                color: "#facc15",
                fontWeight: "bold"
              }}>
                Delivery OTP: {order.delivery_otp}
              </div>
            )}

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
              {new Date(order.created_at).toLocaleString("en-IN")}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="order-actions">

            {["Pending", "Shipped", "Out for Delivery"].includes(order.order_status) && (
              <>
                {order.order_status === "Pending" && (
                  <button
                    className="button"
                    onClick={() => updateStatus(order.id, "Shipped")}
                  >
                    Mark Shipped
                  </button>
                )}

                {order.order_status === "Shipped" && (
                  <button
                    className="button"
                    onClick={() => updateStatus(order.id, "Out for Delivery")}
                  >
                    Out for Delivery
                  </button>
                )}

                {order.order_status === "Out for Delivery" && (
                  <button
                    className="button"
                    onClick={() => updateStatus(order.id, "Delivered")}
                  >
                    Mark Delivered
                  </button>
                )}

                <button
                  className="button delete-btn"
                  style={{ marginLeft: "10px" }}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setShowCancelModal(true);
                  }}
                >
                  Cancel Order
                </button>
              </>
            )}
          </div>

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
                    whiteSpace: "pre-line"
                  }}
                >
                  {order.cancel_reason}
                </div>
              )}
            </div>
          )}

        </div>
      ))}

      {/* CANCEL MODAL (UNCHANGED) */}
      {showCancelModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            background: "#1e293b",
            padding: "25px",
            borderRadius: "10px",
            width: "400px"
          }}>
            <h3>Select Cancel Reason</h3>

            <div>
              <label>
                <input
                  type="radio"
                  value="Out of Stock"
                  onChange={(e) => setCancelReasonType(e.target.value)}
                />
                {" "}Out of Stock
              </label>
            </div>

            <div>
              <label>
                <input
                  type="radio"
                  value="Cancelled on Customer Request"
                  onChange={(e) => setCancelReasonType(e.target.value)}
                />
                {" "}Customer Request
              </label>
            </div>

            <div>
              <label>
                <input
                  type="radio"
                  value="Other"
                  onChange={(e) => setCancelReasonType(e.target.value)}
                />
                {" "}Other
              </label>
            </div>

            {cancelReasonType === "Other" && (
              <textarea
                placeholder="Enter custom reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{ width: "100%", marginTop: "10px" }}
              />
            )}

            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button
                className="button"
                onClick={() => {

                  let finalReason = "";

                  if (cancelReasonType === "Cancelled on Customer Request") {
                    finalReason = "Cancelled on Customer Request";
                  } else {
                    const baseReason =
                      cancelReasonType === "Other"
                        ? customReason
                        : cancelReasonType;

                    finalReason = `${baseReason}

Order cancelled by IZ.
Any prepaid amount will be refunded to your account within a few working days.`;
                  }

                  updateStatus(selectedOrderId, "Cancelled", finalReason);

                  setShowCancelModal(false);
                  setCancelReasonType("");
                  setCustomReason("");
                }}
              >
                Confirm Cancel
              </button>

              <button
                className="button"
                style={{ marginLeft: "10px" }}
                onClick={() => setShowCancelModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Orders;
