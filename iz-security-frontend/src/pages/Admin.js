import { useEffect, useState } from "react";

function Products({ user, cart, setCart }) {

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    stock: ""
  });

  useEffect(() => {
    fetch("https://iz-shop.onrender.com/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // ======================
  // ADMIN FUNCTIONS
  // ======================

  const handleAddProduct = async () => {
    await fetch("https://iz-shop.onrender.com/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    });

    const updated = await fetch("https://iz-shop.onrender.com/products");
    const data = await updated.json();
    setProducts(data);

    setNewProduct({
      name: "",
      description: "",
      price: "",
      image: "",
      stock: ""
    });
  };

  const handleDelete = async (id) => {
    await fetch(`https://iz-shop.onrender.com/products/${id}`, {
      method: "DELETE"
    });

    setProducts(products.filter(p => p.id !== id));
  };

  // ======================
  // CUSTOMER CART LOGIC
  // ======================

  const addToCart = (product) => {

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      const updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }

    alert("Added to cart");
  };

  return (
    <div className="container">

      <h2>Products</h2>

      {/* ================= ADMIN ADD SECTION ================= */}
      {user && user.role === "admin" && (
        <div className="card">
          <h3>Add Product</h3>

          <input placeholder="Name"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
          />

          <input placeholder="Description"
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
          />

          <input placeholder="Price"
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
          />

          <input placeholder="Image URL"
            value={newProduct.image}
            onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
          />

          <input placeholder="Stock"
            value={newProduct.stock}
            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
          />

          <button className="button" onClick={handleAddProduct}>
            Add Product
          </button>
        </div>
      )}

      {/* ================= PRODUCT LIST ================= */}
      {products.map(product => (
        <div className="card" key={product.id}>
          <h4>{product.name}</h4>
          <p>₹{product.price}</p>
          <p>Stock: {product.stock}</p>

          {/* CUSTOMER ADD TO CART */}
          {user && user.role === "customer" && (
            <button
              className="button"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          )}

          {/* ADMIN DELETE */}
          {user && user.role === "admin" && (
            <button
              className="button"
              onClick={() => handleDelete(product.id)}
            >
              Delete
            </button>
          )}

        </div>
      ))}

    </div>
  );
}

export default Products;
