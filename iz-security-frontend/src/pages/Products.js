import { useEffect, useState } from "react";

function Products({ user }) {

 const [products, setProducts] = useState([]);
  const [useFileUpload, setUseFileUpload] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 🔥 Image modal state

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
      const res = await fetch("http://localhost:5000/products");
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
  // ADMIN: ADD PRODUCT
  // ==========================
  const handleAddProduct = async () => {
    try {

      if (useFileUpload) {
        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("description", newProduct.description);
        formData.append("price", newProduct.price);
        formData.append("stock", newProduct.stock);
        formData.append("image", newProduct.image);

        await fetch("http://localhost:5000/upload-product", {
          method: "POST",
          body: formData
        });

      } else {
        await fetch("http://localhost:5000/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct)
        });
      }

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
  // ADMIN: DELETE PRODUCT
  // ==========================
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE"
      });
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // ==========================
  // CUSTOMER: ADD TO CART
  // ==========================
  const addToCart = async (product) => {

    if (!user || !user.id) {
      alert("Please login properly");
      return;
    }

    try {
      await fetch("http://localhost:5000/cart", {
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

      {/* ================= ADMIN ADD SECTION ================= */}
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

          {/* Upload Toggle */}
          <div className="upload-toggle">
            <span>Image Source:</span>

            <div className="toggle-switch">
              <button
                type="button"
                className={!useFileUpload ? "active" : ""}
                onClick={() => setUseFileUpload(false)}
              >
                URL
              </button>

              <button
                type="button"
                className={useFileUpload ? "active" : ""}
                onClick={() => setUseFileUpload(true)}
              >
                Upload
              </button>
            </div>
          </div>

          {/* Upload Input */}
          {useFileUpload ? (
            <div className="file-upload-wrapper">
              <label className="file-upload">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    setNewProduct({ ...newProduct, image: e.target.files[0] })
                  }
                />
              </label>

              {newProduct.image && (
                <span className="file-name">
                  {newProduct.image.name}
                </span>
              )}
            </div>
          ) : (
            <input
              className="url-input"
              placeholder="Enter Image URL"
              value={newProduct.image}
              onChange={e =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />
          )}

          <button className="button" onClick={handleAddProduct}>
            Add Product
          </button>

        </div>
      )}

      {/* ================= PRODUCT GRID ================= */}
      <div className="product-grid">

        {products.map(product => {

          const imageUrl = product.image?.startsWith("/uploads")
            ? `http://localhost:5000${product.image}`
            : product.image;

          return (
            <div className="product-card" key={product.id}>

              {product.image && (
                <div className="image-wrapper">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    style={{ cursor: "zoom-in" }}
                    onClick={() => setSelectedImage(imageUrl)}
                  />
                </div>
              )}

              <h4>{product.name}</h4>
              <p className="desc">{product.description}</p>
              <p className="price">₹{product.price}</p>
              <p className="stock">Stock: {product.stock}</p>

              {user && user.role === "customer" && (
                <button
                  className="button"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              )}

              {user && user.role === "admin" && (
                <button
                  className="button delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              )}

            </div>
          );
        })}

      </div>

      {selectedImage && (
        <div
          className="image-modal"
          onClick={() => {
            setSelectedImage(null);
            setZoomLevel(1);
          }}
        >
          <div
            className="zoom-container"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.preventDefault();
              if (e.deltaY < 0) {
                setZoomLevel((prev) => Math.min(prev + 0.2, 3));
              } else {
                setZoomLevel((prev) => Math.max(prev - 0.2, 1));
              }
            }}
          >
            <img
              src={selectedImage}
              alt="Zoomed"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.2s ease"
              }}
            />

            <div className="zoom-controls">
              <button onClick={() => setZoomLevel(z => Math.min(z + 0.2, 3))}>+</button>
              <button onClick={() => setZoomLevel(z => Math.max(z - 0.2, 1))}>−</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Products;
