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
    image: null,
    imageUrl: "",
    stock: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= SEARCH =================
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= ADD PRODUCT =================
  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);

      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }

      if (newProduct.imageUrl) {
        formData.append("imageUrl", newProduct.imageUrl);
      }

      await fetch(`${API}/upload-product`, {
        method: "POST",
        body: formData
      });

      fetchProducts();

      setNewProduct({
        name: "",
        description: "",
        price: "",
        image: null,
        imageUrl: "",
        stock: ""
      });

      alert("Product Added Successfully");

    } catch (error) {
      console.error(error);
    }
  };

  // ================= UPDATE PRODUCT =================
  const handleUpdateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editProduct.name);
      formData.append("description", editProduct.description);
      formData.append("price", editProduct.price);
      formData.append("stock", editProduct.stock);

      if (editProduct.image instanceof File) {
        formData.append("image", editProduct.image);
      }

      if (editProduct.imageUrl) {
        formData.append("imageUrl", editProduct.imageUrl);
      }

      await fetch(`${API}/products/${editProduct.id}`, {
        method: "PUT",
        body: formData
      });

      setEditMode(false);
      setSelectedProduct(null);
      fetchProducts();

      alert("Product Updated Successfully");

    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/products/${id}`, {
        method: "DELETE"
      });

      fetchProducts();
      setSelectedProduct(null);

    } catch (error) {
      console.error(error);
    }
  };

  // ================= ADD TO CART =================
  const addToCart = async (product) => {
    if (!user?.id) {
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
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: "20px" }}>Products</h2>

      {/* SEARCH */}
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

      {/* ADMIN ADD */}
      {user?.role === "admin" && (
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

          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.files[0] })
            }
          />

          {/* Image URL */}
          <input
            type="text"
            placeholder="Or Enter Image URL"
            value={newProduct.imageUrl}
            onChange={(e) =>
              setNewProduct({ ...newProduct, imageUrl: e.target.value })
            }
          />

          <button className="button" onClick={handleAddProduct}>
            Add Product
          </button>
        </div>
      )}

      {/* PRODUCT GRID */}
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
                  <img src={imageUrl} alt={product.name} />
                </div>
              )}
              <h4 style={{ textAlign: "center", marginTop: "10px" }}>
                {product.name}
              </h4>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <div
          onClick={() => {
            setSelectedProduct(null);
            setEditMode(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",   // 🔥 changed
            padding: "40px 15px",       // 🔥 more top space
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
  paddingTop: "50px",
  width: "100%",
  maxWidth: "500px",
  position: "relative",
  maxHeight: "90vh",
  overflowY: "auto"
            }}
          >
            <button
              onClick={() => {
                setSelectedProduct(null);
                setEditMode(false);
              }}
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

            {/* IMAGE */}
            <img
              src={
                selectedProduct.image?.startsWith("/uploads")
                  ? `${API}${selectedProduct.image}`
                  : selectedProduct.image
              }
              alt={selectedProduct.name}
              style={{ width: "100%", borderRadius: "10px" }}
            />

            {editMode ? (
            <div className="edit-form">
                <input
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />

                <input
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, description: e.target.value })
                  }
                />

                <input
                  type="number"
                  value={editProduct.price}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, price: e.target.value })
                  }
                />

                <input
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, stock: e.target.value })
                  }
                />

                {/* Change Image File */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, image: e.target.files[0] })
                  }
                />

                {/* Change Image URL */}
                <input
                  type="text"
                  placeholder="Or Enter Image URL"
                  value={editProduct.imageUrl || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, imageUrl: e.target.value })
                  }
                />

                <button
  className="button save-btn"
  onClick={handleUpdateProduct}
>
  Save Changes
</button>

              </div>
            ) : (
              <>
                <h3>{selectedProduct.name}</h3>
                <p>{selectedProduct.description}</p>
                <h3 style={{ color: "#38bdf8" }}>
                  ₹{selectedProduct.price}
                </h3>
                <p>Stock: {selectedProduct.stock}</p>

                {user?.role === "customer" && (
                  <button
                    className="button"
                    onClick={() => addToCart(selectedProduct)}
                  >
                    Add to Cart
                  </button>
                )}

                {user?.role === "admin" && (
                  <>
                    <button
                      className="button delete-btn"
                      onClick={() => handleDelete(selectedProduct.id)}
                    >
                      Delete
                    </button>

                    <button
                      className="button"
                      style={{ marginTop: "10px", background: "#f59e0b" }}
                      onClick={() => {
                        setEditMode(true);
                        setEditProduct({
                          ...selectedProduct,
                          imageUrl: selectedProduct.image?.startsWith("/uploads")
                            ? ""
                            : selectedProduct.image
                        });
                      }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
