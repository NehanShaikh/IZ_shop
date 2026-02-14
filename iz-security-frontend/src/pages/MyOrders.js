import { useEffect, useState } from "react";

function MyOrders({ user }) {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetch(`https://iz-shop.onrender.com/my-orders/${user.id}`)
      .then(res => res.json())
      .then(data => {

        // 🔥 Remove duplicate order IDs
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
    await fetch(`https://iz-shop.onrender.com/update-order-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" })
    });

    fetch(`https://iz-shop.onrender.com/my-orders/${user.id}`)
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
  };

  const splitProducts = (productsString) => {
    if (!productsString) return [];

    return productsString
      .split("\n")
      .flatMap(item => item.split(/,(?=\s*[A-Za-z])/))
      .map(item => item.trim())
      .filter(item => item.length > 0);
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

        const productList = splitProducts(order.products);

        return (
          <div className="card" key={order.id}>

            <h4>Order #{orders.length - index}</h4>

            <div>
              <strong>Products:</strong>
              <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
                {productList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

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

          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;
