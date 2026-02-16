import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout({ user }) {

  const navigate = useNavigate();

  const API = "https://iz-shop.onrender.com";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // 🔥 Load cart from database
  useEffect(() => {
    fetch(`${API}/cart/${user.id}`)
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

    // =============================
    // CASH ON DELIVERY
    // =============================
    if (paymentMethod === "COD") {

      const response = await fetch(`${API}/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name,
          phone,
          address,
          paymentMethod: "COD"
        })
      });

      const text = await response.text();
      alert(text);

      navigate("/");
      return;
    }

    // =============================
    // ONLINE PAYMENT
    // =============================
    try {

      const paymentRes = await fetch(`${API}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total })
      });

      const paymentData = await paymentRes.json();

      const options = {
        key: "rzp_test_SGR2OuhuHLx71x", // 🔥 replace with your test key
        amount: paymentData.amount,
        currency: "INR",
        name: "IZ Security System",
        description: "Order Payment",
        order_id: paymentData.id,

        handler: async function (response) {

  const verifyRes = await fetch(`${API}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      userId: user.id,
      name,
      phone,
      address
    })
  });

  const text = await verifyRes.text();

  alert(text);
  navigate("/");
},

        prefill: {
          name: name,
          contact: phone
        },

        theme: {
          color: "#0ea5e9"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment failed. Try again.");
    }
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

          {/* PAYMENT METHOD */}
          <div style={{ marginTop: "20px" }}>
            <strong>Payment Method:</strong>

            <div style={{ marginTop: "10px" }}>
              <label>
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash on Delivery
              </label>
            </div>


            <div style={{ marginTop: "8px" }}>
              <label>
                <input
                  type="radio"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Online Payment
              </label>
            </div>
          </div>

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
