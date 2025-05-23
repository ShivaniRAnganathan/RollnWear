// Main React application for T-Shirt Order Management

// API base URL - will be replaced during deployment
const API_BASE_URL = 'https://tshirt-order-api.onrender.com';

// State management for the entire application
const AppState = {
  tshirts: [],
  cart: [],
  customerName: '',
  customerPhone: '',
  view: 'inventory', // 'inventory', 'order-history'
  
  // Format price as Indian Rupees
  formatPrice(price) {
    return `₹${price}`;
  },
  
  // Fetch t-shirts from the API
  async fetchTshirts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tshirts`);
      const data = await response.json();
      this.tshirts = data;
      this.renderApp();
      this.updateHeaderInfo();
    } catch (error) {
      console.error('Error fetching t-shirts:', error);
      document.getElementById('error-message').textContent = 'Error loading t-shirts. Please try again.';
      document.getElementById('error-message').style.display = 'block';
    }
  },
  
  // Add item to cart
  addToCart(tshirtId) {
    const tshirt = this.tshirts.find(t => t.id === tshirtId);
    if (!tshirt) return;
    
    // Check if item already exists in cart
    const existingItem = this.cart.find(item => item.id === tshirtId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: tshirt.id,
        design_name: tshirt.design_name,
        size: tshirt.size,
        color: tshirt.color,
        price: tshirt.price,
        quantity: 1
      });
    }
    
    this.renderApp();
  },
  
  // Remove item from cart
  removeFromCart(tshirtId) {
    const index = this.cart.findIndex(item => item.id === tshirtId);
    if (index !== -1) {
      this.cart.splice(index, 1);
      this.renderApp();
    }
  },
  
  // Update item quantity in cart
  updateQuantity(tshirtId, change) {
    const item = this.cart.find(item => item.id === tshirtId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
      this.removeFromCart(tshirtId);
    } else {
      this.renderApp();
    }
  },
  
  // Calculate total price
  calculateTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  // Clear cart
  clearCart() {
    this.cart = [];
    this.customerName = '';
    this.customerPhone = '';
    this.renderApp();
  },
  
  // Complete order
  async completeOrder() {
    if (!this.customerName) {
      alert('Please enter customer name');
      return;
    }
    
    const phoneInput = document.getElementById('customer-phone');
    if (!phoneInput.validity.valid) {
      alert('Please enter a valid 10-digit mobile number');
      phoneInput.focus();
      return;
    }
    
    if (this.cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    try {
      for (const item of this.cart) {
        await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_name: this.customerName,
            customer_phone: this.customerPhone,
            quantity: item.quantity,
            tshirt_id: item.id
          })
        });
      }
      
      alert('Order completed successfully!');
      this.clearCart();
      this.fetchTshirts(); // Refresh inventory
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order. Please try again.');
    }
  },
  
  // Change view
  changeView(view) {
    this.view = view;
    this.renderApp();
    
    if (view === 'inventory') {
      this.fetchTshirts();
    } else if (view === 'order-history') {
      this.fetchOrders();
    }
  },
  
  // Fetch order history
  async fetchOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await response.json();
      
      const orderHistoryContent = document.getElementById('order-history-content');
      if (data.length === 0) {
        orderHistoryContent.innerHTML = '<p>No orders found</p>';
        return;
      }
      
      let html = '<div class="order-list">';
      data.forEach(order => {
        html += `
          <div class="order-item">
            <div class="order-header">
              <h3>Order #${order.id}</h3>
              <span>${new Date(order.order_date).toLocaleString()}</span>
            </div>
            <div class="order-details">
              <p>Customer: ${order.customer_name}</p>
              <p class="tshirt-details">${order.tshirt.design_name} - ${order.tshirt.size} - ${order.tshirt.color}</p>
              <p>Quantity: ${order.quantity}</p>
              <p>Price: ${this.formatPrice(order.tshirt.price)} each</p>
              <p>Total: ${this.formatPrice(order.tshirt.price * order.quantity)}</p>
            </div>
          </div>
        `;
      });
      html += '</div>';
      
      orderHistoryContent.innerHTML = html;
    } catch (error) {
      console.error('Error fetching orders:', error);
      document.getElementById('order-history-content').innerHTML = '<p>Error loading orders</p>';
    }
  },
  
  // Calculate total items in inventory
  calculateTotalItems() {
    return this.tshirts.reduce((total, tshirt) => total + tshirt.quantity, 0);
  },
  
  // Calculate total inventory value
  calculateTotalValue() {
    return this.tshirts.reduce((total, tshirt) => total + (tshirt.quantity * tshirt.price), 0);
  },
  
  // Reset the entire inventory
  async resetInventory() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Inventory has been reset successfully!');
        this.fetchTshirts(); // Refresh the display
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset inventory');
      }
    } catch (error) {
      console.error('Error resetting inventory:', error);
      alert('Error resetting inventory: ' + error.message);
    }
  },
  
  // Update stock based on sales
  async updateStock() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/update-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Stock has been updated successfully!');
        this.fetchTshirts(); // Refresh the display
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock: ' + error.message);
    }
  },
  
  // Update header information
  updateHeaderInfo() {
    const totalItemsElement = document.getElementById('total-items');
    const totalValueElement = document.getElementById('total-value');
    const inventoryDateElement = document.getElementById('inventory-date');
    
    const totalItems = this.calculateTotalItems();
    const totalValue = this.calculateTotalValue();
    
    // Update the current date
    const currentDate = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    
    if (totalItemsElement) {
      totalItemsElement.textContent = `Total Items: ${totalItems}`;
    }
    
    if (totalValueElement) {
      totalValueElement.textContent = `Total Value: ${this.formatPrice(totalValue)}`;
    }
    
    if (inventoryDateElement) {
      inventoryDateElement.textContent = `Inventory as of ${currentDate.toLocaleDateString('en-US', dateOptions)}`;
    }
  },
  
  // Render the application
  renderApp() {
    this.renderInventory();
    this.renderCart();
    this.updateHeaderInfo();
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    if (this.view === 'inventory') {
      document.getElementById('inventory-section').style.display = 'block';
      document.getElementById('order-history-section').style.display = 'none';
      document.getElementById('inventory-btn').classList.add('active');
    } else if (this.view === 'order-history') {
      document.getElementById('inventory-section').style.display = 'none';
      document.getElementById('order-history-section').style.display = 'block';
      document.getElementById('order-history-btn').classList.add('active');
    }
  },
  
  // Render inventory section
  renderInventory() {
    const tshirtGrid = document.getElementById('tshirt-grid');
    if (!tshirtGrid) return;
    
    // Group t-shirts by design name
    const tshirtsByDesign = {};
    this.tshirts.forEach(tshirt => {
      if (!tshirtsByDesign[tshirt.design_name]) {
        tshirtsByDesign[tshirt.design_name] = [];
      }
      tshirtsByDesign[tshirt.design_name].push(tshirt);
    });
    
    let html = '';
    Object.keys(tshirtsByDesign).sort().forEach(designName => {
      const designTshirts = tshirtsByDesign[designName];
      designTshirts.sort((a, b) => {
        const sizeOrder = { '2XL': 0, 'XL': 1, 'L': 2, 'M': 3 };
        return sizeOrder[a.size] - sizeOrder[b.size];
      });
      
      designTshirts.forEach(tshirt => {
        const isLowStock = tshirt.quantity <= 3;
        html += `
          <div class="tshirt-card">
            <div class="tshirt-info">
              <h3 class="tshirt-title">${tshirt.design_name}</h3>
              <div class="tshirt-subtitle">${tshirt.size} • ${tshirt.color}</div>
            </div>
            
            <div class="stock-info">
              <div class="stock-count">Stock: ${tshirt.quantity}</div>
              ${isLowStock ? `
                <div class="low-stock">
                  <span class="low-stock-icon">⚠</span>
                  Low stock
                </div>
              ` : ''}
            </div>
            
            <div class="tshirt-price">${this.formatPrice(tshirt.price)}</div>
            
            <button class="btn-add" onclick="AppState.addToCart(${tshirt.id})">
              Add to Order
            </button>
          </div>
        `;
      });
    });
    
    tshirtGrid.innerHTML = html;
  },
  
  // Render cart section
  renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const orderTotal = document.getElementById('order-total');
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    
    if (!cartItemsContainer || !orderTotal) return;
    
    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>No items in cart</p>';
      orderTotal.textContent = '₹0';
    } else {
      let html = '';
      this.cart.forEach(item => {
        html += `
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-title">${item.design_name}</div>
              <div class="cart-item-subtitle">${item.size} • ${item.color}</div>
              <div class="cart-item-price">${this.formatPrice(item.price)} × ${item.quantity}</div>
            </div>
            
            <div class="quantity-control">
              <button class="quantity-btn" onclick="AppState.updateQuantity(${item.id}, -1)">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" onclick="AppState.updateQuantity(${item.id}, 1)">+</button>
            </div>
          </div>
        `;
      });
      
      cartItemsContainer.innerHTML = html;
      orderTotal.textContent = this.formatPrice(this.calculateTotal());
    }
    
    // Update customer form inputs
    if (customerNameInput) {
      customerNameInput.value = this.customerName;
    }
    if (customerPhoneInput) {
      customerPhoneInput.value = this.customerPhone;
    }
  }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  document.getElementById('customer-name').addEventListener('input', (e) => {
    AppState.customerName = e.target.value;
  });
  
  document.getElementById('customer-phone').addEventListener('input', (e) => {
    AppState.customerPhone = e.target.value;
  });
  
  document.getElementById('complete-order-btn').addEventListener('click', () => {
    AppState.completeOrder();
  });
  
  document.getElementById('clear-order-btn').addEventListener('click', () => {
    AppState.clearCart();
  });
  
  document.getElementById('new-order-btn').addEventListener('click', () => {
    AppState.changeView('inventory');
  });
  
  document.getElementById('inventory-btn').addEventListener('click', () => {
    AppState.changeView('inventory');
  });
  
  document.getElementById('order-history-btn').addEventListener('click', () => {
    AppState.changeView('order-history');
  });
  
  // Add event listeners for reset inventory and update stock buttons
  document.getElementById('reset-inventory-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the entire inventory? This cannot be undone.')) {
      AppState.resetInventory();
    }
  });
  
  document.getElementById('update-stock-btn').addEventListener('click', () => {
    AppState.updateStock();
  });
  
  // Fetch t-shirts on load
  AppState.fetchTshirts();
});
