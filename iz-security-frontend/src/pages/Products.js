import { useEffect, useState } from "react";

function Products({ user }) {
  const API = "https://iz-shop.onrender.com";

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    stock: ""
  });

  // ==========================
  // FETCH PRODUCTS
  // ==========================
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================
  // SEARCH FILTER
  // ==========================
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================
  // ADD PRODUCT (ADMIN)
  // ==========================
  const handleAddProduct = async () => {
    try {
      await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });

      fetchProducts();

      setNewProduct({
        name: "",
        description: "",
        price: "",
        image: "",
        stock: ""
      });

      alert("Product Added Successfully");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // ==========================
  // DELETE PRODUCT (ADMIN)
  // ==========================
  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/products/${id}`, {
        method: "DELETE"
      });
      fetchProducts();
      setSelectedProduct(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // ==========================
  // ADD TO CART (CUSTOMER)
  // ==========================
  const addToCart = async (product) => {
    if (!user || !user.id) {
      alert("Please login properly");
      return;
    }

    try {
      await fetch(`${API}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id
        })
      });

      alert("Added to Cart");
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: "20px" }}>Products</h2>

      {/* 🔍 SEARCH */}
      <div style={{ marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white"
          }}
        />
      </div>

      {/* ================= ADMIN ADD ================= */}
      {user && user.role === "admin" && (
        <div className="admin-card">
          <h3>Add Product</h3>

          <input
            placeholder="Name"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
          />

          <input
            placeholder="Description"
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
          />

          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
          />

          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
          />

          <input
            placeholder="Image URL"
            value={newProduct.image}
            onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
          />

          <button className="button" onClick={handleAddProduct}>
            Add Product
          </button>
        </div>
      )}

      {/* ================= PRODUCT GRID ================= */}
      <div className="product-grid">
        {filteredProducts.map(product => {
          const imageUrl = product.image?.startsWith("/uploads")
            ? `${API}${product.image}`
            : product.image;

          return (
            <div
              className="product-card"
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              style={{ cursor: "pointer" }}
            >
              {product.image && (
                <div className="image-wrapper">
                  <img
                    src={imageUrl}
                    alt={product.name}
                  />
                </div>
              )}

              <h4 style={{ textAlign: "center", marginTop: "10px" }}>
                {product.name}
              </h4>
            </div>
          );
        })}
      </div>

      {/* ================= PRODUCT DETAILS MODAL ================= */}
      {selectedProduct && (
        <div
  className="image-modal"
  onClick={() => setSelectedProduct(null)}
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    maxWidth: "100vw",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflowY: "auto",
    padding: "15px",
    zIndex: 5000
  }}
>
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      background: "#1e293b",
      borderRadius: "12px",
      padding: "20px",
      width: "100%",
      maxWidth: "500px",
      maxHeight: "90vh",
      overflowY: "auto"
    }}
  >

            <img
              src={
                selectedProduct.image?.startsWith("/uploads")
                  ? `${API}${selectedProduct.image}`
                  : selectedProduct.image
              }
              alt={selectedProduct.name}
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "15px"
              }}
            />

            <h3>{selectedProduct.name}</h3>

            <p style={{ margin: "10px 0", color: "#94a3b8" }}>
              {selectedProduct.description}
            </p>

            <h3 style={{ color: "#38bdf8" }}>
              ₹{selectedProduct.price}
            </h3>

            <p>Stock: {selectedProduct.stock}</p>

            {user && user.role === "customer" && (
              <button
                className="button"
                style={{ marginTop: "15px" }}
                onClick={() => addToCart(selectedProduct)}
              >
                Add to Cart
              </button>
            )}

            {user && user.role === "admin" && (
              <button
                className="button delete-btn"
                style={{ marginTop: "15px" }}
                onClick={() => handleDelete(selectedProduct.id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
