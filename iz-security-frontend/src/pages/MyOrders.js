import { useEffect, useState } from "react";

function MyOrders({ user }) {

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const fetchOrders = () => {
      fetch(`http://localhost:5000/my-orders/${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(data));
    };

    if (user) {
      fetchOrders();
    }

  }, [user]);

  const cancelOrder = async (id) => {

    await fetch(`http://localhost:5000/update-order-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" })
    });

    fetch(`http://localhost:5000/my-orders/${user.id}`)
      .then(res => res.json())
      .then(data => setOrders(data));
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

        return (
          <div className="card" key={order.id}>

            <h4>Order #{orders.length - index}</h4>
            {/* 🔥 Product Image Added */}
            {order.image && (
              <img
                src={
                  order.image.startsWith("/uploads")
                    ? `http://localhost:5000${order.image}`
                    : order.image
                }
                alt="Product"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px"
                }}
              />
            )}

            <p><strong>Products:</strong> {order.products}</p>
            <p><strong>Total:</strong> ₹{order.total_amount}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span style={{
                color:
                  order.order_status === "Cancelled"
                    ? "red"
                    : order.order_status === "Delivered"
                    ? "green"
                    : "orange"
              }}>
                {order.order_status}
              </span>
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>

            {canCancel && (
              <>
                <button
                  className="button"
                  style={{ marginTop: "10px", backgroundColor: "red", color: "white" }}
                  onClick={() => cancelOrder(order.id)}
                >
                  Cancel Order
                </button>

                <p style={{ fontSize: "12px", color: "gray", marginTop: "5px" }}>
                  You can cancel this order within 24 hours.
                  <br />
                  Time remaining: {hoursLeft} hours
                </p>
              </>
            )}

            {!canCancel && order.order_status === "Pending" && (
              <p style={{ color: "gray", marginTop: "10px" }}>
                Orders cannot be cancelled after 24 hours from purchase.
              </p>
            )}

            {order.order_status === "Cancelled" && (
              <p style={{ color: "red", marginTop: "10px" }}>
                This order has been cancelled.
              </p>
            )}

          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;
