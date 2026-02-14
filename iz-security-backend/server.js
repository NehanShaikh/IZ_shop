const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
app.use(cors());
app.use(express.json());

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

    if (err) {
      return res.status(500).send("Database error");
    }

    if (results.length > 0) {
      // User already exists
      return res.json(results[0]);
    } else {
      // Insert new user as customer
      const insertUser = "INSERT INTO users (name, email) VALUES (?, ?)";

      db.query(insertUser, [name, email], (err2, result2) => {
        if (err2) {
          return res.status(500).send("Insert error");
        }

        res.json({
          id: result2.insertId,
          name,
          email,
          role: "customer"
        });
      });
    }
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

// Serve uploaded images
app.use("/uploads", express.static(uploadDir));


// Save Order API
app.post("/place-order", async (req, res) => {

  const { userId, name, phone, address } = req.body;

  try {

    // 🔥 Get Cart Items
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

      // 🔥 Save order in DB
      const orderQuery = `
        INSERT INTO orders
        (user_id, customer_name, phone, address, products, total_amount)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(orderQuery,
        [userId, name, phone, address, productList, total],
        async (err2) => {

          if (err2) return res.status(500).send("Order save error");

          // 🔥 Send WhatsApp via Twilio
          await client.messages.create({
            body: `
🛒 NEW ORDER - IZ Security System

👤 Name: ${name}
📞 Phone: ${phone}
📍 Address: ${address}

📦 Products:
${productList}
💰 Total: ₹${total}
            `,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: process.env.ADMIN_WHATSAPP
          });

          // 🔥 Clear Cart After Order
          db.query("DELETE FROM cart WHERE user_id = ?", [userId]);

          res.send("Order placed successfully & WhatsApp sent!");
        });

    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Twilio error");
  }
});


app.post("/upload-product", upload.single("image"), (req, res) => {

  console.log("Body:", req.body);
  console.log("File:", req.file);

  const { name, description, price, stock } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Image not uploaded" });
  }

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price required" });
  }

  const imagePath = `/uploads/${req.file.filename}`;
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
    SELECT id, products, total_amount, order_status, created_at
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

app.put("/products/:id", (req, res) => {
  const { name, description, price, image, stock } = req.body;

  const sql = `
    UPDATE products 
    SET name=?, description=?, price=?, image=?, stock=? 
    WHERE id=?`;

  db.query(sql, [name, description, price, image, stock, req.params.id], (err) => {
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
app.put("/update-order-status/:id", (req, res) => {

  const { status } = req.body;

  const sql = `
    UPDATE orders
    SET order_status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating order");
    }
    res.send("Order status updated");
  });

});


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
