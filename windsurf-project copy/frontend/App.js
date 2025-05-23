import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Add, 
  RemoveShoppingCart, 
  Delete, 
  Refresh, 
  RestartAlt,
  ShoppingCart,
  Inventory
} from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [tshirts, setTshirts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedTshirt, setSelectedTshirt] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTshirts();
    fetchOrders();
  }, []);

  // Use environment variable in production, fallback to localhost in development
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5008';

  const fetchTshirts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tshirts`);
      setTshirts(response.data);
    } catch (error) {
      console.error('Error fetching tshirts:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedTshirt || !customerName || !customerPhone || quantity <= 0) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders`, {
        tshirt_id: selectedTshirt,
        customer_name: customerName,
        quantity: quantity,
        customer_phone: customerPhone
      });
      
      setOrders([...orders, response.data]);
      setSelectedTshirt(null);
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      fetchTshirts(); // Refresh inventory
      
      setAlert({
        open: true,
        message: 'Order created successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating order:', error);
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Failed to create order',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/orders/${orderId}`);
      // Refresh both orders and tshirts to update quantities
      await Promise.all([fetchOrders(), fetchTshirts()]);
      
      setAlert({
        open: true,
        message: 'Order deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      setAlert({
        open: true,
        message: 'Failed to delete order. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetInventory = async () => {
    if (!window.confirm('Are you sure you want to reset the inventory to its initial state?')) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/reset-inventory`);
      await fetchTshirts();
      
      setAlert({
        open: true,
        message: 'Inventory reset successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error resetting inventory:', error);
      setAlert({
        open: true,
        message: 'Failed to reset inventory',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshInventory = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/update-stock`);
      await fetchTshirts();
      
      setAlert({
        open: true,
        message: 'Inventory refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing inventory:', error);
      setAlert({
        open: true,
        message: 'Failed to refresh inventory',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Inventory sx={{ mr: 2 }} fontSize="large" />
          Inventory Management System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage inventory, track orders, and customer information
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Inventory Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Inventory
              </Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<Refresh />}
                  onClick={handleRefreshInventory}
                  sx={{ mr: 1 }}
                >
                  Refresh
                </Button>
                <Button 
                  variant="outlined" 
                  color="warning" 
                  startIcon={<RestartAlt />}
                  onClick={handleResetInventory}
                >
                  Reset
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Design</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tshirts.map((tshirt) => (
                    <TableRow key={tshirt.id} sx={{
                      bgcolor: tshirt.quantity <= 2 ? '#fff4e5' : 'inherit'
                    }}>
                      <TableCell>{tshirt.design_name}</TableCell>
                      <TableCell>{tshirt.size}</TableCell>
                      <TableCell>{tshirt.color}</TableCell>
                      <TableCell>${tshirt.price}</TableCell>
                      <TableCell>
                        <Typography 
                          color={tshirt.quantity <= 2 ? 'error' : 'inherit'}
                          fontWeight={tshirt.quantity <= 2 ? 'bold' : 'normal'}
                        >
                          {tshirt.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => setSelectedTshirt(tshirt.id)}
                          disabled={tshirt.quantity === 0}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Order Form Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShoppingCart sx={{ mr: 1 }} />
              <Typography variant="h6">
                Create New Order
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                sx={{ mb: 2 }}
                required
                placeholder="e.g., 1234567890"
              />
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateOrder}
                disabled={!selectedTshirt || !customerName || !customerPhone || quantity <= 0 || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Create Order'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Orders History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RemoveShoppingCart sx={{ mr: 1 }} />
              <Typography variant="h6">
                Order History
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>T-Shirt</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.customer_phone}</TableCell>
                      <TableCell>
                        {order.tshirt.design_name} - {order.tshirt.size} {order.tshirt.color}
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: order.status === 'pending' ? 'warning.light' : 'success.light',
                            display: 'inline-block'
                          }}
                        >
                          {order.status}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      {/* Snackbar for alerts */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert({...alert, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setAlert({...alert, open: false})} 
          severity={alert.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
