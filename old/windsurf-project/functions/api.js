// Serverless function for Netlify deployment
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Mock data for the inventory management system
let tshirts = [
  { id: 1, design_name: 'Winging It', size: 'S', quantity: 10, price: 720, color: 'Black' },
  { id: 2, design_name: 'Winging It', size: 'M', quantity: 8, price: 720, color: 'Black' },
  { id: 3, design_name: 'Power to the Meeple', size: 'L', quantity: 5, price: 720, color: 'Navy' },
  { id: 4, design_name: 'The Board Gamer', size: 'XL', quantity: 7, price: 720, color: 'Black' },
  { id: 5, design_name: 'VIRTU Meeple', size: 'S', quantity: 12, price: 720, color: 'Navy' },
  { id: 6, design_name: 'Game Night', size: 'M', quantity: 9, price: 720, color: 'Black' }
];

let orders = [];
let orderId = 1;

app.use(cors());
app.use(bodyParser.json());

// Get all tshirts
app.get('/api/tshirts', (req, res) => {
  res.json(tshirts);
});

// Create a new order
app.post('/api/orders', (req, res) => {
  const { tshirt_id, customer_name, customer_phone, quantity } = req.body;
  
  const tshirt = tshirts.find(t => t.id === tshirt_id);
  
  if (!tshirt) {
    return res.status(404).json({ error: 'T-shirt not found' });
  }
  
  if (tshirt.quantity < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }
  
  // Create order
  const order = {
    id: orderId++,
    customer_name,
    customer_phone,
    tshirt_id,
    quantity,
    status: 'pending',
    order_date: new Date().toISOString(),
    tshirt: { ...tshirt }
  };
  
  // Update inventory
  tshirt.quantity -= quantity;
  
  orders.push(order);
  res.json(order);
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Delete an order
app.delete('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const order = orders[orderIndex];
  const tshirt = tshirts.find(t => t.id === order.tshirt_id);
  
  if (tshirt) {
    tshirt.quantity += order.quantity;
  }
  
  orders.splice(orderIndex, 1);
  res.json({ message: 'Order deleted successfully' });
});

// Reset inventory
app.post('/api/reset-inventory', (req, res) => {
  tshirts = [
    { id: 1, design_name: 'Winging It', size: 'S', quantity: 10, price: 720, color: 'Black' },
    { id: 2, design_name: 'Winging It', size: 'M', quantity: 8, price: 720, color: 'Black' },
    { id: 3, design_name: 'Power to the Meeple', size: 'L', quantity: 5, price: 720, color: 'Navy' },
    { id: 4, design_name: 'The Board Gamer', size: 'XL', quantity: 7, price: 720, color: 'Black' },
    { id: 5, design_name: 'VIRTU Meeple', size: 'S', quantity: 12, price: 720, color: 'Navy' },
    { id: 6, design_name: 'Game Night', size: 'M', quantity: 9, price: 720, color: 'Black' }
  ];
  
  res.json({ message: 'Inventory reset successfully' });
});

// Update inventory (refresh)
app.post('/api/update-stock', (req, res) => {
  tshirts.forEach(tshirt => {
    if (tshirt.quantity < 5) {
      // Add between 1-3 items
      tshirt.quantity += Math.floor(Math.random() * 3) + 1;
    }
  });
  
  res.json({ message: 'Stock updated successfully' });
});

// For serverless deployment
module.exports.handler = serverless(app);
