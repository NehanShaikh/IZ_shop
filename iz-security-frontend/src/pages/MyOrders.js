import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

function MyOrders({ user }) {

  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      })
      .catch(err => {
      console.error("Fetch error:", err);
      setLoading(false); // 🔥 VERY IMPORTANT
    });

  }, [user]);

  if (loading) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "60vh"
    }}>
      <ClipLoader size={60} />
    </div>
  );
}

  const cancelOrder = async () => {

  if (!cancelReason.trim()) {
    alert("Please enter cancellation reason");
    return;
  }

  await fetch(`${API}/update-order-status/${cancelOrderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "Cancelled",
      reason: cancelReason
    })
  });

  setCancelOrderId(null);
  setCancelReason("");

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

  const getStepIndex = (status) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Shipped":
        return 1;
      case "Out for Delivery":
        return 2;
      case "Delivered":
        return 3;
      default:
        return -1;
    }
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

            {/* Order Progress */}
            {order.order_status !== "Cancelled" && (
              <div
                style={{
                  margin: "25px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative"
                }}
              >
                {["Ordered", "Shipped", "Out for Delivery", "Delivered"].map(
                  (step, i) => {
                    const activeStep = getStepIndex(order.order_status);

                    return (
                      <div
                        key={i}
                        style={{
                          textAlign: "center",
                          flex: 1,
                          position: "relative"
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            margin: "0 auto",
                            backgroundColor:
                              i <= activeStep ? "#22c55e" : "#475569",
                            color: "white",
                            lineHeight: "28px",
                            fontSize: "14px"
                          }}
                        >
                          ✓
                        </div>

                        <div style={{ marginTop: "8px", fontSize: "13px" }}>
                          {step}
                        </div>

                        {i !== 3 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "14px",
                              left: "50%",
                              width: "100%",
                              height: "3px",
                              backgroundColor:
                                i < activeStep ? "#22c55e" : "#475569",
                              zIndex: -1
                            }}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* Products */}
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
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API}/products`);
                        const allProducts = await res.json();

                        const cleanName = product.name
                          .replace(/\s*x\s*\d+$/i, "")
                          .trim();

                        const fullProduct = allProducts.find(p =>
                          p.name.toLowerCase() === cleanName.toLowerCase()
                        );

                        if (fullProduct) {
                          setSelectedProduct(fullProduct);
                        }
                      } catch (error) {
                        console.error(error);
                      }
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

            {/* OTP */}
            {order.order_status === "Out for Delivery" && order.delivery_otp && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  border: "1px solid #facc15",
                  color: "#facc15",
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                Delivery OTP: {order.delivery_otp}
              </div>
            )}

            <p><strong>Total:</strong> ₹{order.total_amount}</p>
            
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
                {order.order_status === "Pending"
                  ? "Ordered"
                  : order.order_status}
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

{/* 🔥 SHOW CANCEL REASON */}
{order.order_status === "Cancelled" && order.cancel_reason && (
  <div
    style={{
      marginTop: "12px",
      padding: "12px",
      backgroundColor: "#0f172a",
      borderRadius: "8px",
      border: "1px solid #ef4444",
      color: "#f87171"
    }}
  >
    <strong>Cancellation Reason:</strong>
    <div style={{ 
  marginTop: "6px",
  whiteSpace: "pre-line"
}}>
      {order.cancel_reason}
    </div>
  </div>
)}

            {/* Receipt */}
{order.order_status === "Delivered" && order.invoice_pdf && (
  <div style={{ marginTop: "15px" }}>
    <a
      href={`${order.invoice_pdf}?fl_attachment=true`}
      download={`Invoice_${order.id}.pdf`}
      style={{
        backgroundColor: "#22c55e",
        color: "white",
        padding: "8px 15px",
        borderRadius: "6px",
        textDecoration: "none",
        display: "inline-block"
      }}
    >
      📄 View Receipt
    </a>
  </div>
)}


            {/* Cancel */}
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
                  onClick={() => {
  setCancelOrderId(order.id);
  setCancelReason("");
}}
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

      {/* ================= PRODUCT DETAILS MODAL ================= */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "40px 15px",
            overflowY: "auto",
            zIndex: 5000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              padding: "20px",
              paddingTop: "50px",
              width: "100%",
              maxWidth: "500px",
              position: "relative"
            }}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                color: "white",
                cursor: "pointer"
              }}
            >
              ✕
            </button>

            <img
              src={
                selectedProduct.image?.startsWith("/uploads")
                  ? `${API}${selectedProduct.image}`
                  : selectedProduct.image
              }
              alt={selectedProduct.name}
              style={{ width: "100%", borderRadius: "10px" }}
            />

            <h3 style={{ marginTop: "15px" }}>
              {selectedProduct.name}
            </h3>

            <p>{selectedProduct.description}</p>

            {/* Show Original Price (if exists) */}
{selectedProduct.original_price && (
  <p style={{
    textDecoration: "line-through",
    color: "#94a3b8",
    fontSize: "14px"
  }}>
    ₹{selectedProduct.original_price}
  </p>
)}

{/* Show Discounted Price */}
<h3 style={{ color: "#22c55e" }}>
  ₹{selectedProduct.price}
</h3>

            <p>Stock: {selectedProduct.stock}</p>

          </div>
        </div>
      )}

      {/* ================= CANCEL MODAL ================= */}
{cancelOrderId && (
  <div
    onClick={() => setCancelOrderId(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 6000
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "400px"
      }}
    >
      <h3>Cancel Order</h3>

      <textarea
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        placeholder="Enter cancellation reason..."
        style={{
          width: "100%",
          height: "80px",
          marginTop: "10px",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #475569",
          background: "#0f172a",
          color: "white"
        }}
      />

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={cancelOrder}
          style={{
            flex: 1,
            backgroundColor: "red",
            color: "white",
            padding: "8px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Confirm Cancel
        </button>

        <button
          onClick={() => setCancelOrderId(null)}
          style={{
            flex: 1,
            backgroundColor: "#475569",
            color: "white",
            padding: "8px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
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

export default MyOrders;
