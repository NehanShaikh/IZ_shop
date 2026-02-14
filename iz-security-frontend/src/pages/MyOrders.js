import { useEffect, useState } from "react";

function MyOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch all products to get images
  useEffect(() => {
    fetch('https://iz-shop.onrender.com/products')
      .then(res => res.json())
      .then(data => {
        // Create a map of product name -> product details
        const productMap = {};
        data.forEach(p => {
          productMap[p.name.toLowerCase()] = p;
        });
        setProducts(productMap);
      });
  }, []);

  useEffect(() => {
    if (!user) return;

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

  // Parse products and match with images
  const parseProductsWithImages = (productsString) => {
    if (!productsString) return [];
    
    return productsString
      .split("\n")
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => {
        // Parse "Product Name xQuantity"
        const match = item.match(/(.+?)\s*x(\d+)$/i);
        if (match) {
          const productName = match[1].trim();
          const quantity = parseInt(match[2]);
          const productInfo = products[productName.toLowerCase()];
          
          return {
            name: productName,
            quantity: quantity,
            original: item,
            image: productInfo?.image || null,
            price: productInfo?.price || null,
            description: productInfo?.description || null
          };
        }
        
        // If no quantity format
        const productInfo = products[item.toLowerCase()];
        return {
          name: item,
          quantity: 1,
          original: item,
          image: productInfo?.image || null,
          price: productInfo?.price || null,
          description: productInfo?.description || null
        };
      });
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

        // Parse products with images
        const productList = parseProductsWithImages(order.products);

        return (
          <div className="card" key={order.id} style={{ 
            marginBottom: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h4>Order #{order.id}</h4>

            <div>
              <strong style={{ fontSize: "16px" }}>Products:</strong>
              
              <div style={{ marginTop: "15px" }}>
                {productList.map((item, i) => (
                  <div key={i} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "20px",
                    marginBottom: "15px",
                    padding: "15px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9"
                  }}>
                    {/* Product Image */}
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #ddd"
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "80px",
                        height: "80px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#999",
                        border: "1px solid #ddd"
                      }}>
                        No Image
                      </div>
                    )}
                    
                    {/* Product Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "14px", color: "#666", marginBottom: "3px" }}>
                        Quantity: {item.quantity}
                      </div>
                      {item.price && (
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "3px" }}>
                          Price: ₹{item.price}
                        </div>
                      )}
                      {item.description && (
                        <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                          {item.description.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              marginTop: "15px", 
              padding: "10px", 
              backgroundColor: "#f5f5f5", 
              borderRadius: "5px" 
            }}>
              <p><strong>Total:</strong> ₹{order.total_amount}</p>

              <p>
                <strong>Status:</strong>{" "}
                <span style={{
                  color:
                    order.order_status === "Cancelled"
                      ? "red"
                      : order.order_status === "Delivered"
                      ? "green"
                      : "#ff6b00",
                  fontWeight: "bold",
                  padding: "2px 8px",
                  backgroundColor: 
                    order.order_status === "Cancelled"
                      ? "#ffe6e6"
                      : order.order_status === "Delivered"
                      ? "#e6ffe6"
                      : "#fff0e6",
                  borderRadius: "4px"
                }}>
                  {order.order_status}
                </span>
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            {canCancel && (
              <div style={{ marginTop: "15px" }}>
                <button
                  className="button"
                  style={{ 
                    backgroundColor: "#dc3545", 
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                  onClick={() => cancelOrder(order.id)}
                >
                  Cancel Order
                </button>

                <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                  You can cancel this order within 24 hours.
                  <br />
                  <strong>Time remaining: {hoursLeft} hours</strong>
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;
