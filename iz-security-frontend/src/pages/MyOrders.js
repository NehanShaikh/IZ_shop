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
    }).replace(',', '');
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
        return { bg: '#fee', color: '#c00', text: 'CANCELLED' };
      case 'delivered':
        return { bg: '#e8f5e9', color: '#2e7d32', text: 'DELIVERED' };
      case 'pending':
        return { bg: '#fff3e0', color: '#ed6c02', text: 'PENDING' };
      case 'processing':
        return { bg: '#e3f2fd', color: '#0288d1', text: 'PROCESSING' };
      default:
        return { bg: '#f5f5f5', color: '#666', text: status?.toUpperCase() || 'PENDING' };
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `https://iz-shop.onrender.com/${imagePath}`;
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p>Please log in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>

      {loading && (
        <div style={styles.loadingState}>
          <p>Loading your orders...</p>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyStateText}>No orders found.</p>
          <p style={styles.emptyStateSubtext}>Start shopping to see your orders here!</p>
        </div>
      )}

      {orders.map((order, index) => {
        const status = getStatusColor(order.order_status);
        const canCancel = order.order_status?.toLowerCase() === "pending";
        const timeRemaining = getTimeRemaining(order.created_at);
        const isCancelling = cancellingId === order.id;

        return (
          <div key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <div style={styles.orderHeader}>
              <h2 style={styles.orderNumber}>Order #{orders.length - index}</h2>
              <span style={styles.orderDate}>{formatDate(order.created_at)}</span>
            </div>

            {/* Products Section */}
            <div style={styles.productsSection}>
              <h3 style={styles.sectionTitle}>Products:</h3>
              
              {order.products_list && order.products_list.length > 0 ? (
                <div style={styles.productsGrid}>
                  {order.products_list.map((product, i) => (
                    <div key={i} style={styles.productCard}>
                      {/* Product Image */}
                      <div style={styles.imageContainer}>
                        {product.image ? (
                          <img 
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            style={styles.productImage}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div style="
                                  width: 60px;
                                  height: 60px;
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  border-radius: 8px;
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  color: white;
                                  font-size: 24px;
                                  font-weight: bold;
                                  text-transform: uppercase;
                                ">
                                  ${product.name.charAt(0)}
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div style={styles.imagePlaceholder}>
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Product Name */}
                      <div style={styles.productInfo}>
                        <span style={styles.productName}>{product.name}</span>
                        {product.matchedWith && (
                          <span style={styles.matchedBadge}>✓ In Stock</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noProducts}>
                  <p>No product details available</p>
                </div>
              )}
            </div>

            {/* Order Footer */}
            <div style={styles.orderFooter}>
              <div style={styles.orderDetails}>
                <div style={styles.totalAmount}>
                  <span style={styles.totalLabel}>Total Amount:</span>
                  <span style={styles.totalValue}>₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
                
                <div style={styles.statusContainer}>
                  <span style={styles.statusLabel}>Status:</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: status.bg,
                    color: status.color
                  }}>
                    {status.text}
                  </span>
                </div>
              </div>

              {canCancel && (
                <div style={styles.cancelSection}>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={isCancelling}
                    style={{
                      ...styles.cancelButton,
                      opacity: isCancelling ? 0.7 : 1,
                      cursor: isCancelling ? 'not-allowed' : 'pointer'
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
                    <p style={styles.timeRemaining}>
                      ⏰ Time remaining: <span style={styles.timeValue}>{timeRemaining}</span>
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

// Styles object
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '3px solid #e0e0e0',
    letterSpacing: '-0.5px'
  },
  loadingState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    color: '#666',
    fontSize: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  emptyStateText: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '10px',
    fontWeight: '500'
  },
  emptyStateSubtext: {
    fontSize: '16px',
    color: '#999'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.3s ease',
    border: '1px solid #f0f0f0'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f0f0f0'
  },
  orderNumber: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  orderDate: {
    fontSize: '14px',
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: '6px 12px',
    borderRadius: '20px'
  },
  productsSection: {
    marginBottom: '25px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '15px'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px'
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #eee',
    transition: 'all 0.2s ease'
  },
  imageContainer: {
    width: '60px',
    height: '60px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  productName: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    lineHeight: '1.4'
  },
  matchedBadge: {
    fontSize: '11px',
    color: '#2e7d32',
    backgroundColor: '#e8f5e9',
    padding: '2px 8px',
    borderRadius: '12px',
    display: 'inline-block',
    alignSelf: 'flex-start'
  },
  noProducts: {
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic'
  },
  orderFooter: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    border: '1px solid #eee',
    marginTop: '10px'
  },
  orderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  totalAmount: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#555'
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2e7d32'
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statusLabel: {
    fontSize: '14px',
    color: '#666'
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  cancelSection: {
    textAlign: 'right'
  },
  cancelButton: {
    padding: '12px 32px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 4px rgba(220,53,69,0.2)'
  },
  timeRemaining: {
    fontSize: '13px',
    color: '#666',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  timeValue: {
    color: '#dc3545',
    fontWeight: '600',
    backgroundColor: '#fee',
    padding: '2px 8px',
    borderRadius: '12px'
  }
};

// Media queries for responsiveness
const mediaStyles = `
  @media (max-width: 768px) {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    
    .products-grid {
      grid-template-columns: 1fr !important;
    }
    
    .order-footer {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .cancel-section {
      text-align: left;
      width: 100%;
    }
    
    .cancel-button {
      width: 100%;
    }
  }
`;

// Add media styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mediaStyles;
  document.head.appendChild(style);
}

export default MyOrders;
