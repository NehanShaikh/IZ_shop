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
                                fallback.style.width = '70px';
                                fallback.style.height = '70px';
                                fallback.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                fallback.style.borderRadius = '8px';
                                fallback.style.display = 'flex';
                                fallback.style.alignItems = 'center';
                                fallback.style.justifyContent = 'center';
                                fallback.style.color = 'white';
                                fallback.style.fontSize = '28px';
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
                          {/* Show if product was matched */}
                          {product.matchedWith && (
                            <span style={styles.matchedBadge}>
                              ✓ In stock
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

// Fixed Styles object - removed weird purple border
// Updated Styles object - with purple border and matching background
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f0f2f5',
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
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    color: '#666',
    fontSize: '16px',
    border: '1px solid #423c85'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #423c85'
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
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    transition: 'box-shadow 0.3s ease',
    border: '2px solid #423c85'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid #423c85'
  },
  orderNumber: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  orderDate: {
    fontSize: '14px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '6px 14px',
    borderRadius: '30px',
    fontWeight: '500',
    border: '1px solid #423c85'
  },
  productsSection: {
    marginBottom: '25px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px'
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #423c85',
    transition: 'all 0.2s ease'
  },
  imageContainer: {
    width: '70px',
    height: '70px',
    flexShrink: 0,
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    border: '1px solid #423c85',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '28px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
    border: '1px solid #423c85'
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  productName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  quantityBadge: {
    fontSize: '12px',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'inline-block',
    alignSelf: 'flex-start',
    fontWeight: '500',
    border: '1px solid #423c85'
  },
  matchedBadge: {
    fontSize: '11px',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'inline-block',
    alignSelf: 'flex-start',
    fontWeight: '500',
    border: '1px solid #423c85'
  },
  noProducts: {
    padding: '40px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    border: '2px dashed #423c85'
  },
  orderFooter: {
    backgroundColor: '#f8fafc',
    padding: '22px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    border: '1px solid #423c85',
    marginTop: '10px'
  },
  orderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  totalAmount: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#475569'
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#059669'
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '6px 18px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #423c85'
  },
  cancelSection: {
    textAlign: 'right'
  },
  cancelButton: {
  padding: '14px 36px',
  backgroundColor: '#dc2626',
  color: 'white',
  border: '1px solid #423c85',
  borderRadius: '40px',
  fontSize: '15px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  transition: 'background-color 0.3s ease',
  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
  cursor: 'pointer'
},
  timeRemaining: {
    fontSize: '14px',
    color: '#475569',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  timeValue: {
    color: '#dc2626',
    fontWeight: '700',
    backgroundColor: '#fee2e2',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '13px',
    border: '1px solid #423c85'
  }
};

export default MyOrders;
