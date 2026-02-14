import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout({ user }) {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState([]);

  // 🔥 Load cart from database
  useEffect(() => {
    fetch(`https://iz-shop.onrender.com/cart/${user.id}`)
      .then(res => res.json())
      .then(data => setCart(data));
  }, [user]);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleOrder = async () => {

  if (!name || !phone || !address) {
    alert("Please fill all details");
    return;
  }

  const response = await fetch("https://iz-shop.onrender.com/place-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      name,
      phone,
      address
    })
  });

  const text = await response.text();
  alert(text);

  navigate("/");
};


  return (
    <div className="checkout-page">

      <div className="checkout-card">

        <h2 className="checkout-title">Secure Checkout</h2>

        <div className="checkout-form">

          <input
            className="checkout-input"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            className="checkout-input"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <textarea
            className="checkout-textarea"
            placeholder="Full Delivery Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />

        </div>

        <div className="checkout-summary">
          <h3>Total Amount</h3>
          <h1>₹{total}</h1>
        </div>

        <button
          className="checkout-btn"
          onClick={handleOrder}
        >
          Place Order
        </button>

      </div>

    </div>
  );
}

export default Checkout;
