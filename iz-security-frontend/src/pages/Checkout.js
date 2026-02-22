import ClipLoader from "react-spinners/ClipLoader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout({ user }) {

  const navigate = useNavigate();
  const API = "https://iz-shop.onrender.com";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);        
  const [processing, setProcessing] = useState(false); 
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // 🔥 Load cart from database
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`${API}/cart/${user.id}`)
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

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

    setProcessing(true);

    // =============================
    // CASH ON DELIVERY
    // =============================
    if (paymentMethod === "COD") {

      try {
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

        setProcessing(false);
        navigate("/");
      } catch (error) {
        console.error(error);
        alert("Order failed. Try again.");
        setProcessing(false);
      }

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
        key: "rzp_test_SGR2OuhuHLx71x",
        amount: paymentData.amount,
        currency: "INR",
        name: "IZ Security System",
        description: "Order Payment",
        order_id: paymentData.id,

        handler: async function (response) {

          try {
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

            setProcessing(false);
            navigate("/");

          } catch (error) {
            console.error(error);
            alert("Payment verification failed.");
            setProcessing(false);
          }
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
      setProcessing(false);
    }
  };

  // 🔥 Loading screen
  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh"
      }}>
        <ClipLoader size={60} color="#0ea5e9" />
        <p style={{ marginTop: "15px", color: "#0ea5e9" }}>
          Preparing your checkout...
        </p>
      </div>
    );
  }

  // 🔥 User safety
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Please login to continue</h2>
      </div>
    );
  }

  // 🔥 Empty cart protection
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Your cart is empty</h2>
      </div>
    );
  }

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
          disabled={processing}
        >
          {processing ? <ClipLoader size={20} color="#fff" /> : "Place Order"}
        </button>

      </div>

    </div>
  );
}

export default Checkout;
