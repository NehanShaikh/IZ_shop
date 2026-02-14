import { useEffect, useState, useCallback } from "react";

function MyOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://iz-shop.onrender.com/my-orders/${user.id}`);
      const data = await response.json();
      
      console.log("API Response:", data);

      // Remove duplicate order IDs
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
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (id) => {
    setCancellingId(id);
    try {
      await fetch(`https://iz-shop.onrender.com/update-order-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" })
      });

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
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
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

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Please log in to view your orders.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ 
        marginBottom: '30px', 
        borderBottom: '2px solid #f0f0f0', 
        paddingBottom: '10px',
        fontFamily: 'Arial, sans-serif'
      }}>
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
            style={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '25px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {/* Order Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                Order #{orders.length - index}
              </h3>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {formatDate(order.created_at)}
              </span>
            </div>

            {/* Products Grid */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ marginBottom: '15px', color: '#555', fontSize: '16px' }}>
                Products:
              </h4>
              
              {order.products_list && order.products_list.length > 0 ? (
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {order.products_list.map((product, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex',
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        border: '1px solid #eee',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Product Image */}
                      <div style={{ 
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ddd',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {product.image ? (
                          <img 
                            src={product.image}
                            alt={product.name}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div style="
                                  font-size: 11px; 
                                  color: #999; 
                                  text-align: center;
                                  padding: 5px;
                                ">
                                  Image<br/>not available
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#999',
                            textAlign: 'center',
                            padding: '5px'
                          }}>
                            No image
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ 
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '5px',
                          wordBreak: 'break-word'
                        }}>
                          {product.name}
                        </div>
                        {product.matchedWith && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#28a745',
                            backgroundColor: '#e8f5e9',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'inline-block',
                            alignSelf: 'flex-start'
                          }}>
                            ✓ Matched
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#999', fontStyle: 'italic', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  No product details available
                </div>
              )}
            </div>

            {/* Order Footer */}
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              border: '1px solid #eee'
            }}>
              <div>
                <p style={{ margin: '5px 0', fontSize: '16px' }}>
                  <strong>Total Amount:</strong>{' '}
                  <span style={{ color: '#28a745', fontSize: '18px' }}>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </span>
                </p>
                
                <p style={{ margin: '5px 0' }}>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(order.order_status),
                    color: order.order_status?.toLowerCase() === 'pending' ? '#000' : '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {order.order_status || 'PENDING'}
                  </span>
                </p>
              </div>

              {canCancel && (
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={isCancelling}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: isCancelling ? '#dc354580' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isCancelling ? 'not-allowed' : 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s',
                      boxShadow: '0 2px 4px rgba(220,53,69,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCancelling) e.target.style.backgroundColor = '#c82333';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCancelling) e.target.style.backgroundColor = '#dc3545';
                    }}
                  >
                    {isCancelling ? 'CANCELLING...' : 'CANCEL ORDER'}
                  </button>

                  {timeRemaining && (
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#666',
                      marginTop: '10px'
                    }}>
                      ⏰ Time remaining: <span style={{ color: '#dc3545', fontWeight: '600' }}>{timeRemaining}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;
