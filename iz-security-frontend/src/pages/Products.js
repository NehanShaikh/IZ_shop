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
    stock: "",
    imageFile: null,
    imageUrl: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
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

      if (newProduct.imageFile) {
        formData.append("image", newProduct.imageFile);
      }

      if (newProduct.imageUrl) {
        formData.append("imageUrl", newProduct.imageUrl);
      }

      await fetch(`${API}/products`, {
        method: "POST",
        body: formData
      });

      fetchProducts();

      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageFile: null,
        imageUrl: ""
      });

      alert("Product Added Successfully");

    } catch (err) {
      console.error(err);
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

      if (editProduct.imageFile) {
        formData.append("image", editProduct.imageFile);
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

    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Products</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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

          {/* FILE UPLOAD */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewProduct({ ...newProduct, imageFile: e.target.files[0] })
            }
          />

          {/* IMAGE URL */}
          <input
            type="text"
            placeholder="Or Enter Image URL"
            value={newProduct.imageUrl}
            onChange={(e) =>
              setNewProduct({ ...newProduct, imageUrl: e.target.value })
            }
          />

          <button onClick={handleAddProduct}>Add Product</button>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            style={{ cursor: "pointer" }}
          >
            {product.image && (
              <img src={product.image} alt={product.name} width="100%" />
            )}
            <h4>{product.name}</h4>
          </div>
        ))}
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
            alignItems: "center"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
              position: "relative"
            }}
          >
            <button
              onClick={() => {
                setSelectedProduct(null);
                setEditMode(false);
              }}
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>

            {editMode ? (
              <>
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

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, imageFile: e.target.files[0] })
                  }
                />

                <input
                  type="text"
                  placeholder="Or Enter Image URL"
                  value={editProduct.imageUrl || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, imageUrl: e.target.value })
                  }
                />

                <button onClick={handleUpdateProduct}>Save</button>
              </>
            ) : (
              <>
                {selectedProduct.image && (
                  <img src={selectedProduct.image} alt="" width="100%" />
                )}

                <h3>{selectedProduct.name}</h3>
                <p>{selectedProduct.description}</p>
                <h3>₹{selectedProduct.price}</h3>
                <p>Stock: {selectedProduct.stock}</p>

                {user?.role === "customer" && (
                  <button onClick={() => addToCart(selectedProduct)}>
                    Add to Cart
                  </button>
                )}

                {user?.role === "admin" && (
                  <>
                    <button onClick={() => handleDelete(selectedProduct.id)}>
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditProduct(selectedProduct);
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
