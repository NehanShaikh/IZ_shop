import { useEffect, useState, useCallback } from "react";

function MyOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Wrap fetchOrders in useCallback to prevent unnecessary re-renders
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://iz-shop.onrender.com/my-orders/${user.id}`);
      const data = await response.json();
      
      // Remove duplicate order IDs (just in case)
      const uniqueOrders = [];
      const seenIds = new Set();

      data.forEach(order => {
        if (!seenIds.has(order.id)) {
          seenIds.add(order.id);
          uniqueOrders.push(order);
        }
      });

      setOrders(uniqueOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]); // user is dependency for fetchOrders

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Now fetchOrders is the dependency

  const cancelOrder = async (id) => {
    setCancellingId(id);
    try {
      await fetch(`https://iz-shop.onrender.com/update-order-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" })
      });

      // Refresh orders after cancellation
      await fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeRemaining = (orderDate) => {
    const orderTime = new Date(orderDate);
    const now = new Date();
    const diffHours = (now - orderTime) / (1000 * 60 * 60);
    const hoursLeft = 24 - diffHours;
    
    if (hoursLeft <= 0) return null;
    
    const hours = Math.floor(hoursLeft);
    const minutes = Math.floor((hoursLeft - hours) * 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'cancelled':
        return '#dc3545';
      case 'delivered':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  // Helper function to get product image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend your base URL
    return `https://iz-shop.onrender.com/${imagePath}`;
  };

  // Helper function for splitting products (keep for fallback)
  const splitProducts = (productsString) => {
    if (!productsString) return [];
    return productsString
      .split("\n")
      .flatMap(item => item.split(/,(?=\s*[A-Za-z])/))
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <p>Please log in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
        My Orders
      </h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading your orders...</p>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '18px', color: '#666' }}>No orders found.</p>
          <p style={{ color: '#999', marginTop: '10px' }}>
            Start shopping to see your orders here!
          </p>
        </div>
      )}

      {orders.map((order, index) => {
        const orderTime = new Date(order.created_at);
        const now = new Date();
        const diffHours = (now - orderTime) / (1000 * 60 * 60);
        const canCancel = order.order_status?.toLowerCase() === "pending" && diffHours <= 24;
        const timeRemaining = getTimeRemaining(order.created_at);
        const isCancelling = cancellingId === order.id;

        return (
          <div 
            key={order.id} 
            className="order-card"
            style={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.3s ease'
            }}
          >
            {/* Order Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>
                Order #{orders.length - index}
              </h4>
              <span style={{ 
                fontSize: '14px',
                color: '#666'
              }}>
                {formatDate(order.created_at)}
              </span>
            </div>

            {/* Products Grid */}
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ display: 'block', marginBottom: '12px', color: '#555' }}>
                Products:
              </strong>
              
              {order.products_list && order.products_list.length > 0 ? (
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '15px'
                }}>
                  {order.products_list.map((product, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        textAlign: 'center',
                        padding: '10px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        transition: 'transform 0.2s ease',
                        border: '1px solid #f0f0f0'
                      }}
                    >
                      {/* Product Image */}
                      <div style={{ 
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        {product.image ? (
                          <img 
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              // Show fallback when image fails
                              const parent = e.target.parentElement;
                              const fallback = document.createElement('div');
                              fallback.style.fontSize = '12px';
                              fallback.style.color = '#999';
                              fallback.style.textAlign = 'center';
                              fallback.textContent = 'Image not available';
                              parent.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#999',
                            textAlign: 'center'
                          }}>
                            No image
                          </div>
                        )}
                      </div>
                      
                      {/* Product Name */}
                      <div style={{ 
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '4px',
                        wordBreak: 'break-word'
                      }}>
                        {product.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback if products_list is not available
                <ul style={{ marginLeft: '20px', marginTop: '5px', color: '#666' }}>
                  {splitProducts(order.products).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Order Details */}
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '15px'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Total Amount:</strong>{' '}
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                      ₹{Number(order.total_amount).toFixed(2)}
                    </span>
                  </p>
                  
                  <p style={{ margin: '5px 0' }}>
                    <strong>Status:</strong>{' '}
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      backgroundColor: getStatusColor(order.order_status),
                      color: order.order_status?.toLowerCase() === 'pending' ? '#000' : '#fff',
                      textTransform: 'capitalize'
                    }}>
                      {order.order_status || 'Pending'}
                    </span>
                  </p>
                </div>

                {/* Cancel Button Section */}
                {canCancel && (
                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={isCancelling}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: isCancelling ? '#dc354580' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isCancelling ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s ease',
                        boxShadow: '0 2px 4px rgba(220,53,69,0.2)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCancelling) e.target.style.backgroundColor = '#c82333';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCancelling) e.target.style.backgroundColor = '#dc3545';
                      }}
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>

                    {timeRemaining && (
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        marginTop: '8px',
                        fontStyle: 'italic'
                      }}>
                        ⏰ You can cancel this order within 24 hours.
                        <br />
                        <span style={{ color: '#dc3545', fontWeight: '500' }}>
                          {timeRemaining}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;
