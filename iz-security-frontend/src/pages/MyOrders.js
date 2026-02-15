import { useEffect, useState } from "react";

function MyOrders({ user }) {

  const [orders, setOrders] = useState([]);
  const API = "https://iz-shop.onrender.com";

  useEffect(() => {
    if (!user) return;

    fetch(`${API}/my-orders/${user.id}`)
      .then(res => res.json())
      .then(data => {

        const uniqueOrders = [];
        const seenIds = new Set();

        data.forEach(order => {
          if (!seenIds.has(order.id)) {
            seenIds.add(order.id);
            uniqueOrders.push(order);
          }
        });

        setOrders(uniqueOrders);
      });

  }, [user]);

  const cancelOrder = async (id) => {

    await fetch(`${API}/update-order-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" }) // no reason
    });

    const res = await fetch(`${API}/my-orders/${user.id}`);
    const data = await res.json();

    const uniqueOrders = [];
    const seenIds = new Set();

    data.forEach(order => {
      if (!seenIds.has(order.id)) {
        seenIds.add(order.id);
        uniqueOrders.push(order);
      }
    });

    setOrders(uniqueOrders);
  };

  return (
    <div className="container">
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order, index) => {

        const orderTime = new Date(order.created_at);
        const now = new Date();
        const diffHours = (now - orderTime) / (1000 * 60 * 60);

        const canCancel =
          order.order_status === "Pending" &&
          diffHours <= 24;

        const hoursLeft = Math.max(0, 24 - diffHours).toFixed(1);

        const productList = order.products_list || [];

        return (
          <div
            className="card"
            key={order.id}
            style={{
              marginBottom: "20px",
              padding: "20px",
              borderRadius: "10px",
              backgroundColor: "#1e293b"
            }}
          >
            <h4>Order #{orders.length - index}</h4>

            <div style={{ marginTop: "10px" }}>
              <strong>Products:</strong>

              <div style={{ marginTop: "10px" }}>
                {productList.map((product, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      marginBottom: "12px",
                      background: "#0f172a",
                      padding: "12px",
                      borderRadius: "8px"
                    }}
                  >
                    <img
                      src={
                        product.image
                          ? product.image.startsWith("/uploads")
                            ? `${API}${product.image}`
                            : product.image
                          : "https://via.placeholder.com/70"
                      }
                      alt={product.name}
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "6px"
                      }}
                    />

                    <div style={{ fontSize: "15px", fontWeight: "500" }}>
                      {product.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p><strong>Total:</strong> ₹{order.total_amount}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color:
                    order.order_status === "Cancelled"
                      ? "red"
                      : order.order_status === "Delivered"
                      ? "green"
                      : "orange"
                }}
              >
                {order.order_status}
              </span>

              {/* 🔥 Show reason only if exists (admin cancel) */}
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
            </p>

            <p>
  <strong>Payment:</strong>{" "}
  <span
    style={{
      fontWeight: "bold",
      color:
        order.payment_status === "Paid"
          ? "#22c55e"
          : "#facc15"
    }}
  >
    {order.payment_status === "Paid"
      ? "Paid Online"
      : order.payment_method === "COD"
      ? "Cash on Delivery"
      : "Pending"}
  </span>
</p>

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

            {canCancel && (
              <>
                <button
                  style={{
                    marginTop: "10px",
                    backgroundColor: "red",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                  onClick={() => cancelOrder(order.id)}
                >
                  Cancel Order
                </button>

                <p
                  style={{
                    fontSize: "12px",
                    color: "gray",
                    marginTop: "5px"
                  }}
                >
                  You can cancel this order within 24 hours.
                  <br />
                  Time remaining: {hoursLeft} hours
                </p>
              </>
            )}

          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;
