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
    if (imagePath.startsWith('/uploads')) {
      return `https://iz-shop.onrender.com${imagePath}`;
    }
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
                  {order.products_list.map((product, i) => {
                    // Extract product name without quantity for display
                    const displayName = product.name.replace(/\s*x\s*\d+$/i, '').trim();
                    
                    return (
                      <div key={i} style={styles.productCard}>
                        {/* Product Image */}
                        <div style={styles.imageContainer}>
                          {product.image ? (
                            <img 
                              src={getImageUrl(product.image)}
                              alt={displayName}
                              style={styles.productImage}
                              onError={(e) => {
                                console.log(`Failed to load image for ${displayName}:`, product.image);
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                // Create fallback element
                                const fallback = document.createElement('div');
                                fallback.style.width = '60px';
                                fallback.style.height = '60px';
                                fallback.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                fallback.style.borderRadius = '8px';
                                fallback.style.display = 'flex';
                                fallback.style.alignItems = 'center';
                                fallback.style.justifyContent = 'center';
                                fallback.style.color = 'white';
                                fallback.style.fontSize = '24px';
                                fallback.style.fontWeight = 'bold';
                                fallback.style.textTransform = 'uppercase';
                                fallback.textContent = displayName.charAt(0).toUpperCase();
                                e.target.parentElement.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div style={styles.imagePlaceholder}>
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div style={styles.productInfo}>
                          <span style={styles.productName}>
                            {displayName}
                          </span>
                          {product.name.includes('x1') && (
                            <span style={styles.quantityBadge}>
                              Qty: 1
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

// Styles matching your product cards exactly
// Styles matching your product cards EXACTLY
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f5f5f5',  // Same as your products page background
    minHeight: '100vh'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '25px',
    paddingBottom: '10px',
    borderBottom: '2px solid #ddd'
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f5f5f5',  // Same as product card background
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    color: '#666',
    border: '1px solid #e0e0e0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f5f5f5',  // Same as product card background
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  },
  emptyStateText: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '10px',
    fontWeight: '500'
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: '#999'
  },
  orderCard: {
    backgroundColor: '#f5f5f5',  // Same light gray as product cards
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',  // Subtle shadow like product cards
    transition: 'box-shadow 0.3s ease',
    border: '1px solid #e0e0e0'  // Subtle border like product cards
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #d0d0d0',  // Slightly darker border for separation
    flexWrap: 'wrap',
    gap: '10px'
  },
  orderNumber: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  orderDate: {
    fontSize: '13px',
    color: '#666',
    backgroundColor: '#e8e8e8',  // Slightly darker than card background
    padding: '4px 10px',
    borderRadius: '4px'
  },
  productsSection: {
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '12px'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px'
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#ffffff',  // White background for inner product cards (like in your screenshot)
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  imageContainer: {
    width: '60px',
    height: '60px',
    flexShrink: 0,
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd'
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
    borderRadius: '6px',
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
    gap: '4px'
  },
  productName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  quantityBadge: {
    fontSize: '11px',
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: '2px 8px',
    borderRadius: '12px',
    display: 'inline-block',
    alignSelf: 'flex-start'
  },
  noProducts: {
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    border: '1px dashed #ccc'
  },
  orderFooter: {
    backgroundColor: '#e8e8e8',  // Slightly darker than card background for contrast
    padding: '15px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    border: '1px solid #d0d0d0',
    marginTop: '10px'
  },
  orderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  totalAmount: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  totalLabel: {
    fontSize: '14px',
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
    gap: '8px',
    flexWrap: 'wrap'
  },
  statusLabel: {
    fontSize: '13px',
    color: '#666'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  cancelSection: {
    textAlign: 'right',
    minWidth: '200px'
  },
  cancelButton: {
    padding: '10px 24px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 4px rgba(220,53,69,0.2)',
    width: '100%',
    cursor: 'pointer'
  },
  timeRemaining: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '5px',
    flexWrap: 'wrap'
  },
  timeValue: {
    color: '#dc3545',
    fontWeight: '600',
    backgroundColor: '#fee',
    padding: '2px 8px',
    borderRadius: '4px'
  }
};

// Add responsive styles as a style tag
const responsiveStyles = `
  @media (max-width: 768px) {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
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
    
    .total-amount, .status-container {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 10px;
    }
    
    .order-card {
      padding: 15px;
    }
    
    .product-card {
      padding: 10px;
    }
    
    .image-container {
      width: 50px;
      height: 50px;
    }
    
    .image-placeholder {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
    
    .product-name {
      font-size: 13px;
    }
    
    .total-value {
      font-size: 18px;
    }
    
    .cancel-button {
      padding: 8px 16px;
      font-size: 12px;
    }
  }
`;

// Add responsive styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = responsiveStyles;
  document.head.appendChild(style);
}

export default MyOrders;

