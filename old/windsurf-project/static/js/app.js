// Main React application for T-Shirt Order Management

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
  
  // API base URL - points to the backend server
  apiBaseUrl: 'http://localhost:5008',
  
  // Fetch t-shirts from the API
  async fetchTshirts() {
    try {
      const url = `${this.apiBaseUrl}/api/tshirts`;
      console.log('Fetching t-shirts from:', url);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'  // Important for cookies, authorization headers with HTTPS
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('T-shirts data:', data);
      
      this.tshirts = data;
      this.renderApp();
      this.updateHeaderInfo();
      
      // Hide error message if it was shown
      const errorElement = document.getElementById('error-message');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    } catch (error) {
      console.error('Error in fetchTshirts:', error);
      const errorElement = document.getElementById('error-message') || document.createElement('div');
      errorElement.id = 'error-message';
      errorElement.textContent = `Error loading t-shirts: ${error.message}. Please try again.`;
      errorElement.style.color = 'red';
      errorElement.style.padding = '10px';
      errorElement.style.margin = '10px 0';
      errorElement.style.border = '1px solid #ffcccc';
      errorElement.style.borderRadius = '4px';
      errorElement.style.backgroundColor = '#fff0f0';
      
      // Insert error message after the header if it doesn't exist
      if (!document.getElementById('error-message')) {
        const header = document.querySelector('header');
        if (header) {
          header.insertAdjacentElement('afterend', errorElement);
        } else {
          document.body.prepend(errorElement);
        }
      }
    }
  },
  
  // Add item to cart
  addToCart(tshirtId) {
    const tshirt = this.tshirts.find(t => t.id === tshirtId);
    if (!tshirt) return;
    
    // Check available stock
    const availableStock = tshirt.quantity - (this.cart.find(item => item.id === tshirtId)?.quantity || 0);
    
    if (availableStock <= 0) {
      alert('Sorry, this item is out of stock');
      return;
    }
    
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
        quantity: 1,
        max_quantity: tshirt.quantity
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
    
    const tshirt = this.tshirts.find(t => t.id === tshirtId);
    if (!tshirt) return;
    
    const newQuantity = item.quantity + change;
    const availableStock = tshirt.quantity - (this.cart.find(i => i.id === tshirtId)?.quantity || 0) + item.quantity;
    
    if (newQuantity <= 0) {
      this.removeFromCart(tshirtId);
    } else if (newQuantity > availableStock) {
      alert(`Only ${availableStock} units available in stock`);
    } else {
      item.quantity = newQuantity;
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
    if (this.cart.length === 0) {
      alert('Cart is empty');
      return false;
    }
    
    try {
      // Process all order items
      const orderPromises = this.cart.map(item => {
        return fetch(`${this.apiBaseUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            customer_name: this.customerName,
            customer_phone: this.customerPhone,
            quantity: item.quantity,
            tshirt_id: item.id
          })
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        });
      });

      // Wait for all orders to complete
      await Promise.all(orderPromises);
      
      // Show success message
      alert('Order completed successfully!');
      
      // Reset the form
      const nameInput = document.getElementById('customer-name');
      const phoneInput = document.getElementById('customer-phone');
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
      
      // Clear cart and refresh inventory
      this.clearCart();
      await this.fetchTshirts();
      
      return true;
    } catch (error) {
      console.error('Error completing order:', error);
      alert(`Error completing order: ${error.message}. Please try again.`);
      return false;
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
      const response = await fetch(`${this.apiBaseUrl}/api/orders`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
              <div class="customer-info">
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                ${order.customer_phone ? `<p><strong>Phone:</strong> ${order.customer_phone}</p>` : ''}
              </div>
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
      const response = await fetch(`${this.apiBaseUrl}/api/reset-inventory`, {
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
      const response = await fetch(`${this.apiBaseUrl}/api/update-stock`, {
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
    const proceedBtn = document.getElementById('proceed-to-checkout-btn');
    
    if (!cartItemsContainer || !orderTotal || !proceedBtn) return;
    
    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>No items in cart</p>';
      orderTotal.textContent = '₹0';
      proceedBtn.disabled = true;
    } else {
      proceedBtn.disabled = false;
      let html = '';
      this.cart.forEach(item => {
        html += `
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-title">${item.design_name}</div>
              <div class="cart-item-subtitle">${item.size} • ${item.color}</div>
              <div class="cart-item-price">${this.formatPrice(item.price)} × ${item.quantity}</div>
              <div class="stock-info">${this.tshirts.find(t => t.id === item.id)?.quantity || 0} in stock</div>
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
    
    // Update customer name and phone in state
    if (this.customerName) {
      const customerNameInput = document.getElementById('customer-name');
      if (customerNameInput) customerNameInput.value = this.customerName;
    }
    if (this.customerPhone) {
      const customerPhoneInput = document.getElementById('customer-phone');
      if (customerPhoneInput) customerPhoneInput.value = this.customerPhone;
    }
  }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Modal elements
  const modal = document.getElementById('checkout-modal');
  const proceedBtn = document.getElementById('proceed-to-checkout-btn');
  const closeModalBtns = document.querySelectorAll('.close-modal, #cancel-checkout');
  const submitOrderBtn = document.getElementById('submit-order');
  const customerNameInput = document.getElementById('customer-name');
  const customerPhoneInput = document.getElementById('customer-phone');
  
  // Toggle modal function
  function toggleModal(show) {
    if (show) {
      modal.style.display = 'flex';
      customerNameInput.focus();
    } else {
      modal.style.display = 'none';
    }
  }
  
  // Validate form
  function validateForm() {
    const name = customerNameInput.value.trim();
    const phone = customerPhoneInput.value.trim();
    const isValid = name.length > 0 && /^\d{10}$/.test(phone);
    submitOrderBtn.disabled = !isValid;
    return isValid;
  }
  
  // Event Listeners
  proceedBtn.addEventListener('click', () => toggleModal(true));
  
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => toggleModal(false));
  });
  
  customerNameInput.addEventListener('input', (e) => {
    AppState.customerName = e.target.value.trim();
    validateForm();
  });
  
  customerPhoneInput.addEventListener('input', (e) => {
    AppState.customerPhone = e.target.value.trim();
    validateForm();
  });
  
  submitOrderBtn.addEventListener('click', async () => {
    if (validateForm()) {
      // Disable the submit button to prevent multiple clicks
      submitOrderBtn.disabled = true;
      submitOrderBtn.textContent = 'Processing...';
      
      try {
        const success = await AppState.completeOrder();
        if (success) {
          // Only close the modal if the order was successful
          toggleModal(false);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      } finally {
        // Re-enable the submit button
        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = 'Place Order';
      }
    }
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
  
  // Close modal when clicking outside the modal content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      toggleModal(false);
    }
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
