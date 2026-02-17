const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
app.use(cors());
app.use(express.json());

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔥 SMTP Transporter (Render Safe)


// 🎉 Welcome / First Login Email
// 🎉 Welcome / First Login Email
async function sendFirstLoginEmail(email, name) {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_USER,  // ✅ Verified sender from Render
      subject: "Welcome to IZ Security System 🎉",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hello ${name}, 👋</h2>
          <p>Welcome to <strong>IZ Security System</strong>.</p>
          <p>Your account has been successfully created.</p>
          <hr/>
          <small>This is an automated message.</small>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log("Welcome email sent successfully ✅");

  } catch (error) {
    console.error("SendGrid Welcome Email Error:", error.response?.body || error);
  }
}


// 🛒 Order Confirmation Email
async function sendOrderConfirmationEmail(
  email,
  name,
  orderId,
  productList,
  total,
  paymentMethod,
  address
) {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_USER,  // ✅ Verified sender from Render
      subject: `Order Confirmation - IZ Security System (#${orderId})`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Thank you for your order, ${name}! 🎉</h2>

          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Delivery Address:</strong> ${address}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>

          <h3>Products Ordered:</h3>
          <pre>${productList}</pre>

          <h3>Total Amount: ₹${total}</h3>

          <hr/>
          <small>This is an automated confirmation email.</small>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log("Order confirmation email sent ✅");

  } catch (error) {
    console.error("SendGrid Order Email Error:", error.response?.body || error);
  }
}


async function sendStatusUpdateEmail(email, name, orderId, status, otp = null) {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: `Your Order #${orderId} is now ${status}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hello ${name},</h2>

          <p>Your order <strong>#${orderId}</strong> status has been updated.</p>

          <h3 style="color:#38bdf8;">Current Status: ${status}</h3>

          ${
            status === "Shipped"
              ? "<p>Your order has been shipped 🚚</p>"
              : status === "Out for Delivery"
              ? `<p>Your order is out for delivery today 📦</p>
                 <h2 style="color:#ef4444;">Delivery OTP: ${otp}</h2>
                 <p>Please share this OTP with delivery agent to confirm delivery.</p>`
              : status === "Delivered"
              ? "<p>Your order has been delivered successfully ✅</p>"
              : ""
          }

          <hr/>
          <small>Thank you for shopping with IZ Security System.</small>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log("Status email sent ✅");

  } catch (error) {
    console.error("Status Email Error:", error.response?.body || error);
  }
}


// Connect to MySQL
const db = mysql.createConnection(process.env.DATABASE_URL);


db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

// Save or Get User
app.post("/save-user", (req, res) => {

  const { name, email } = req.body;

  const checkUser = "SELECT * FROM users WHERE email = ?";

  db.query(checkUser, [email], (err, results) => {

    if (err) return res.status(500).send("Database error");

    if (results.length > 0) {
      return res.json(results[0]); // Already exists
    }

    const insertUser = "INSERT INTO users (name, email) VALUES (?, ?)";

    db.query(insertUser, [name, email], async (err2, result2) => {

      if (err2) return res.status(500).send("Insert error");

      // 🔥 Send mail for ANY first-time user
      try {
        await sendFirstLoginEmail(email, name);
      } catch (e) {
        console.log("Mail error:", e);
      }

      res.json({
        id: result2.insertId,
        name,
        email,
        role: "customer"
      });
    });
  });
});


// Configure Storage
const fs = require("fs");

const uploadDir = path.join(__dirname, "uploads");




// Create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const uploadInvoice = multer({
  storage: multer.memoryStorage()
});



const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "invoices",
        format: "pdf",               // ✅ FORCE FORMAT
        type: "upload"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};


// Serve uploaded images
app.use("/uploads", express.static(uploadDir));



// 🔥 Common Order Logic Function
// 🔥 Common Order Logic Function
async function placeOrderLogic(req, res) {

  const { userId, name, phone, address, paymentMethod } = req.body;

  try {

    const cartQuery = `
      SELECT products.name, cart.quantity, products.price
      FROM cart
      JOIN products ON cart.product_id = products.id
      WHERE cart.user_id = ?
    `;

    db.query(cartQuery, [userId], async (err, cartItems) => {

      if (err) return res.status(500).send("Error fetching cart");
      if (cartItems.length === 0)
        return res.status(400).send("Cart is empty");

      let total = 0;

      const productList = cartItems.map(item => {
        total += item.price * item.quantity;
        return `${item.name} x${item.quantity}`;
      }).join("\n");

      const paymentStatus =
        paymentMethod === "ONLINE" ? "Paid" : "Pending";

      const orderQuery = `
        INSERT INTO orders
        (user_id, customer_name, phone, address, products, total_amount, payment_method, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(orderQuery,
  [userId, name, phone, address, productList, total, paymentMethod, paymentStatus],
  async (err2, result) => {

    if (err2) return res.status(500).send("Order save error");

    const orderId = result.insertId; // ✅ Global ID (for admin & WhatsApp)

    // WhatsApp (UNCHANGED)
    await client.messages.create({
      body: `
🛒 NEW ORDER

🆔 Order ID: ${orderId}
👤 Name: ${name}
📞 Phone: ${phone}
📍 Address: ${address}

💳 Payment: ${paymentMethod}
💰 Total: ₹${total}

📦 Products:
${productList}
      `,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.ADMIN_WHATSAPP
    });

    // 🔥 Calculate customer-specific order number
    db.query(
      "SELECT COUNT(*) AS total FROM orders WHERE user_id = ?",
      [userId],
      (countErr, countResult) => {

        if (countErr) {
          console.error("Count error:", countErr);
          return;
        }

        const customerOrderNumber = countResult[0].total;

        // Customer email (ONLY THIS PART MODIFIED)
        db.query("SELECT email FROM users WHERE id = ?", [userId], async (err3, userResult) => {

          if (!err3 && userResult.length > 0) {

            const customerEmail = userResult[0].email;

            try {
              await sendOrderConfirmationEmail(
                customerEmail,
                name,
                customerOrderNumber, // 🔥 SEND PERSONAL ORDER NUMBER
                productList,
                total,
                paymentMethod,
                address
              );
            } catch (mailError) {
              console.log("========== EMAIL ERROR ==========");
              console.log(JSON.stringify(mailError, null, 2));
              console.log("=================================");
            }
          }
        });

      }
    );

    db.query("DELETE FROM cart WHERE user_id = ?", [userId]);

    res.send("Order placed successfully!");

  });

});
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

// Example: if you receive invoice file from admin
app.post("/upload-invoice/:orderId", uploadInvoice.single("invoice"), async (req, res) => {

  try {
    const orderId = req.params.orderId;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer);

    const invoiceUrl = result.secure_url;

    // Save URL in DB
    await db.promise().query(
      "UPDATE orders SET invoice_pdf = ? WHERE id = ?",
      [invoiceUrl, orderId]
    );

    res.json({ success: true, invoiceUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }

});



app.get("/test-email", async (req, res) => {
  try {
    await sendFirstLoginEmail("nehanshaikh@gmail.com", "Test User");
    res.send("Email test sent");
  } catch (err) {
  console.log("========== TEST MAIL ERROR ==========");
  console.log(JSON.stringify(err, null, 2));
  console.log("=====================================");
  res.send("Error sending email");
  }
});


// Save Order API
app.post("/place-order", async (req, res) => {

  if (req.body.paymentMethod === "COD") {
    await placeOrderLogic(req, res);
  } else {
    res.status(400).send("Invalid payment method");
  }

});


app.post("/create-payment", async (req, res) => {

  const { amount } = req.body;

  const options = {
    amount: amount * 100, // in paise
    currency: "INR",
    receipt: "receipt_order"
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Payment creation failed");
  }

});


app.post("/verify-payment", async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    name,
    phone,
    address
  } = req.body;

  try {

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).send("Payment verification failed ❌");
    }

    console.log("Payment verified successfully ✅");

    // After verification, place order
    req.body.paymentMethod = "ONLINE";
    await placeOrderLogic(req, res);

  } catch (error) {
    console.error(error);
    res.status(500).send("Verification error");
  }
});

app.post("/upload-product", upload.single("image"), (req, res) => {

  console.log("Body:", req.body);
  console.log("File:", req.file);

  const { name, description, price, stock, imageUrl } = req.body;

  // Basic validation
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price required" });
  }

  let imagePath = null;

  // If file uploaded
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }
  // If image URL provided
  else if (imageUrl) {
    imagePath = imageUrl;
  }
  // If neither provided
  else {
    return res.status(400).json({ error: "Image (file or URL) required" });
  }

  const priceNum = Number(price);
  const stockNum = Number(stock || 0);

  const sql = `
    INSERT INTO products 
    (name, description, price, image, stock)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, description, priceNum, imagePath, stockNum], (err) => {
    if (err) {
      console.error("DB Insert Error:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Product added successfully" });
  });

});



// 🔥 Get orders for specific user
app.get("/my-orders/:userId", (req, res) => {
  const ordersSql = `
    SELECT id, products, total_amount, order_status, payment_method, payment_status, created_at, cancel_reason, delivery_otp, otp_verified, invoice_pdf
    FROM orders
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.query(ordersSql, [req.params.userId], async (err, orders) => {
    if (err) return res.status(500).send("Error fetching orders");

    const allProductsSql = `SELECT name, image FROM products`;

    db.query(allProductsSql, [], (err2, allProducts) => {
      if (err2) return res.status(500).send("Error fetching products");

      const formattedOrders = orders.map(order => {

        const productLines = order.products
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0);

        const products_list = productLines.map(line => {

          const cleanName = line.replace(/\s*x\s*\d+$/i, "").trim();

          const matched = allProducts.find(p =>
            p.name.toLowerCase() === cleanName.toLowerCase()
          );

          return {
            name: line,
            image: matched ? matched.image : null
          };
        });

        return { ...order, products_list };
      });

      res.json(formattedOrders);
    });
  });
});




app.get("/products", (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results);
  });
});


app.post("/products", (req, res) => {
  const { name, description, price, image, stock } = req.body;

  const sql = "INSERT INTO products (name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, description, price, image, stock], (err) => {
    if (err) return res.status(500).send("Error");
    res.send("Product added");
  });
});

app.put("/products/:id", upload.single("image"), (req, res) => {

  const { name, description, price, stock, imageUrl } = req.body;

  let imagePath = imageUrl || null;

  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }

  const sql = `
    UPDATE products 
    SET name=?, description=?, price=?, image=?, stock=? 
    WHERE id=?`;

  db.query(sql, [name, description, price, imagePath, stock, req.params.id], (err) => {
    if (err) return res.status(500).send("Error");
    res.send("Product updated");
  });
});


app.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Error");
    res.send("Product deleted");
  });
});

app.post("/add-product", (req, res) => {
  const { name, price, image } = req.body;

  const sql = "INSERT INTO products (name, price, image) VALUES (?, ?, ?)";
  db.query(sql, [name, price, image], (err) => {
    if (err) res.status(500).send("Error");
    else res.send("Product Added");
  });
});

app.delete("/delete-product/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
    if (err) res.status(500).send("Error");
    else res.send("Deleted");
  });
});

app.post("/cart", (req, res) => {

  console.log("Request body:", req.body);

  const { userId, productId } = req.body;

  console.log("UserId:", userId);
  console.log("ProductId:", productId);

  const checkQuery = `
    SELECT * FROM cart 
    WHERE user_id = ? AND product_id = ?
  `;

  db.query(checkQuery, [userId, productId], (err, results) => {

    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error");
    }

    if (results.length > 0) {

      db.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE id = ?",
        [results[0].id],
        (err2) => {
          if (err2) {
            console.error("Update Error:", err2);
            return res.status(500).send("Error");
          }
          res.send("Cart updated");
        }
      );

    } else {

      db.query(
        "INSERT INTO cart (user_id, product_id) VALUES (?, ?)",
        [userId, productId],
        (err3) => {
          if (err3) {
            console.error("Insert Error:", err3);
            return res.status(500).send("Error");
          }
          res.send("Added to cart");
        }
      );

    }

  });

});


app.get("/cart/:userId", (req, res) => {

  const sql = `
    SELECT 
      cart.id,
      products.id as product_id,
      products.name,
      products.price,
      products.image,
      cart.quantity
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).send("Error");
    res.json(results);
  });

});


app.put("/cart/:id", (req, res) => {

  const { quantity } = req.body;

  const sql = "UPDATE cart SET quantity = ? WHERE id = ?";

  db.query(sql, [quantity, req.params.id], (err) => {
    if (err) return res.status(500).send("Error");
    res.send("Updated");
  });
});



app.delete("/cart/:id", (req, res) => {

  db.query("DELETE FROM cart WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Error");
    res.send("Removed");
  });

});

// Cancel order


app.get("/orders", (req, res) => {
  db.query("SELECT * FROM orders ORDER BY id DESC", (err, results) => {
    if (err) {
      res.status(500).send("Error fetching orders");
    } else {
      res.json(results);
    }
  });
});

// 🔥 Update order status (Admin)
app.put("/update-order-status/:id", async (req, res) => {

  const { status, reason, enteredOtp } = req.body;
  const orderId = req.params.id;

  try {

    // =====================================================
    // 🔐 DELIVERED (VERIFY OTP + FULL EMAIL)
    // =====================================================
    if (status === "Delivered") {

      const [rows] = await db.promise().query(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );

      if (!rows.length)
        return res.status(400).json({ message: "Order not found" });

      const order = rows[0];

      if (order.delivery_otp !== enteredOtp)
        return res.status(400).json({ message: "Invalid OTP ❌" });

      await db.promise().query(
        "UPDATE orders SET order_status = ?, otp_verified = TRUE WHERE id = ?",
        ["Delivered", orderId]
      );

      // 🔥 Get customer email
      const [userRows] = await db.promise().query(
        "SELECT email FROM users WHERE id = ?",
        [order.user_id]
      );

      // 🔥 Get personal order number
      const [countRows] = await db.promise().query(
        "SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND id <= ?",
        [order.user_id, orderId]
      );

      const customerOrderNumber = countRows[0].total;

      if (userRows.length > 0) {

        await sendStatusUpdateEmail(
          userRows[0].email,
          order.customer_name,
          customerOrderNumber,
          "Delivered"
        );
      }

      return res.json({ message: "Delivered Successfully ✅" });
    }

    // =====================================================
    // 🚚 OUT FOR DELIVERY (GENERATE OTP + FULL EMAIL)
    // =====================================================
    if (status === "Out for Delivery") {

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await db.promise().query(
        `UPDATE orders 
         SET order_status = ?, 
             delivery_otp = ?, 
             otp_verified = FALSE 
         WHERE id = ?`,
        ["Out for Delivery", otp, orderId]
      );

      const [rows] = await db.promise().query(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );

      const order = rows[0];

      const [userRows] = await db.promise().query(
        "SELECT email FROM users WHERE id = ?",
        [order.user_id]
      );

      const [countRows] = await db.promise().query(
        "SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND id <= ?",
        [order.user_id, orderId]
      );

      const customerOrderNumber = countRows[0].total;

      if (userRows.length > 0) {

        await sendStatusUpdateEmail(
          userRows[0].email,
          order.customer_name,
          customerOrderNumber,
          "Out for Delivery",
          otp
        );
      }

      return res.json({ message: "Out for Delivery", otp });
    }

    // =====================================================
    // 🚚 SHIPPED (FULL EMAIL)
    // =====================================================
    if (status === "Shipped") {

      await db.promise().query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        ["Shipped", orderId]
      );

      const [rows] = await db.promise().query(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );

      const order = rows[0];

      const [userRows] = await db.promise().query(
        "SELECT email FROM users WHERE id = ?",
        [order.user_id]
      );

      const [countRows] = await db.promise().query(
        "SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND id <= ?",
        [order.user_id, orderId]
      );

      const customerOrderNumber = countRows[0].total;

      if (userRows.length > 0) {

        await sendStatusUpdateEmail(
          userRows[0].email,
          order.customer_name,
          customerOrderNumber,
          "Shipped"
        );
      }

      return res.json({ message: "Shipped Successfully" });
    }

    // =====================================================
    // ❌ CANCELLED (WITH WHATSAPP)
    // =====================================================
    if (status === "Cancelled") {

      await db.promise().query(
        "UPDATE orders SET order_status = ?, cancel_reason = ? WHERE id = ?",
        ["Cancelled", reason || null, orderId]
      );

      if (!reason) {

        const [results] = await db.promise().query(
          "SELECT * FROM orders WHERE id = ?",
          [orderId]
        );

        if (results.length > 0) {

          const order = results[0];

          const message = `
🚨 ORDER CANCELLED BY CUSTOMER

🆔 Order ID: ${order.id}
👤 Customer: ${order.customer_name}
📞 Phone: ${order.phone}
📍 Address: ${order.address}

💳 Payment Method: ${order.payment_method}
💰 Total: ₹${order.total_amount}

📦 Products:
${order.products}
          `;

          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: process.env.ADMIN_WHATSAPP,
            body: message
          });
        }
      }

      return res.json({ message: "Order Cancelled" });
    }

    return res.json({ message: "No changes made" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
