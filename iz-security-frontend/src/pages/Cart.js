import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart({ user }) {

  const [cart, setCart] = useState([]);

  // 🔥 Load cart from database
  useEffect(() => {
    fetch(`http://localhost:5000/cart/${user.id}`)
      .then(res => res.json())
      .then(data => setCart(data));
  }, [user]);

  // 🔥 Increase Quantity
  const increaseQty = async (id, currentQty) => {

    await fetch(`http://localhost:5000/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: currentQty + 1 })
    });

    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: currentQty + 1 }
        : item
    ));
  };

  // 🔥 Decrease Quantity
  const decreaseQty = async (id, currentQty) => {

    if (currentQty <= 1) return;

    await fetch(`http://localhost:5000/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: currentQty - 1 })
    });

    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: currentQty - 1 }
        : item
    ));
  };

  // 🔥 Remove Item
  const removeItem = async (id) => {

    await fetch(`http://localhost:5000/cart/${id}`, {
      method: "DELETE"
    });

    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  return (
    <div className="container">
      <h2>Your Cart</h2>

      {cart.length === 0 && <p>Your cart is empty.</p>}

      {cart.map((item) => (
        <div className="card" key={item.id}>

          {/* 🔥 Product Image Added */}
          {item.image && (
            <img
              src={
                item.image.startsWith("/uploads")
                  ? `http://localhost:5000${item.image}`
                  : item.image
              }
              alt={item.name}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px"
              }}
            />
          )}

          <h4>{item.name}</h4>
          <p>₹{item.price}</p>
          <p>Quantity: {item.quantity}</p>

          <button
            className="button"
            onClick={() => increaseQty(item.id, item.quantity)}
          >
            +
          </button>

          <button
            className="button"
            onClick={() => decreaseQty(item.id, item.quantity)}
          >
            -
          </button>

          <button
            className="button"
            onClick={() => removeItem(item.id)}
          >
            Remove
          </button>

        </div>
      ))}

      {cart.length > 0 && (
        <>
          <h3>Total: ₹{total}</h3>

          <Link to="/checkout">
            <button className="button">
              Proceed to Checkout
            </button>
          </Link>
        </>
      )}

    </div>
  );
}

export default Cart;
