import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5008';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [tshirts, setTshirts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    tshirt_id: '',
    quantity: 1
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(
        order => 
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_phone.includes(searchTerm) ||
          order.tshirt.design_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, tshirtsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/orders`),
        axios.get(`${API_BASE_URL}/api/tshirts`)
      ]);
      
      setOrders(ordersRes.data);
      setFilteredOrders(ordersRes.data);
      setTshirts(tshirtsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, order = null) => {
    setDialogType(type);
    if (order) {
      setCurrentOrder(order);
    } else {
      setFormData({
        customer_name: '',
        customer_phone: '',
        tshirt_id: '',
        quantity: 1
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentOrder(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'tshirt_id' ? Number(value) : value
    }));
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/orders`, formData);
      await fetchData();
      handleCloseDialog();
      showAlert('Order created successfully', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      showAlert(error.response?.data?.error || 'Failed to create order', 'error');
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
      await fetchData();
      showAlert('Order deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting order:', error);
      showAlert('Failed to delete order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = () => {
    setAlert({...alert, open: false});
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Management
      </Typography>

      {/* Action Buttons and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
            >
              Create New Order
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by customer, phone or product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="orders table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell>
                      {order.tshirt.design_name} - {order.tshirt.size} ({order.tshirt.color})
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>₹{order.quantity * order.tshirt.price}</TableCell>
                    <TableCell>
                      {order.status === 'pending' ? (
                        <Chip 
                          label="Pending" 
                          color="warning" 
                          size="small" 
                        />
                      ) : order.status === 'completed' ? (
                        <Chip 
                          label="Completed" 
                          color="success" 
                          size="small" 
                          icon={<CheckCircleIcon />}
                        />
                      ) : (
                        <Chip 
                          label="Cancelled" 
                          color="error" 
                          size="small" 
                          icon={<CancelIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(order.order_date)}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Order Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">Total Orders</Typography>
              <Typography variant="h4">{orders.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">Total Revenue</Typography>
              <Typography variant="h4">
                ₹{orders.reduce((sum, order) => sum + (order.quantity * order.tshirt.price), 0)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">Unique Customers</Typography>
              <Typography variant="h4">
                {new Set(orders.map(order => order.customer_name)).size}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog for Create Order */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            Create New Order
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="customer_name"
                  label="Customer Name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="customer_phone"
                  label="Phone Number"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  placeholder="e.g., 1234567890"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Product</InputLabel>
                  <Select
                    name="tshirt_id"
                    value={formData.tshirt_id}
                    onChange={handleInputChange}
                    label="Product"
                  >
                    {tshirts.filter(t => t.quantity > 0).map(tshirt => (
                      <MenuItem key={tshirt.id} value={tshirt.id}>
                        {tshirt.design_name} - {tshirt.size} ({tshirt.color}) - ₹{tshirt.price} - {tshirt.quantity} in stock
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateOrder}
            disabled={!formData.customer_name || !formData.customer_phone || !formData.tshirt_id || formData.quantity < 1}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;
