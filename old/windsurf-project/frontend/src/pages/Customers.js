import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  ShoppingCart as OrdersIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5008';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        customer => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch orders to extract unique customers
      const response = await axios.get(`${API_BASE_URL}/api/orders`);
      const orders = response.data;
      
      // Extract unique customers with their order details
      const customerMap = new Map();
      
      orders.forEach(order => {
        const customerId = `${order.customer_name}-${order.customer_phone}`;
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: order.customer_name,
            phone: order.customer_phone,
            orders: [order],
            totalSpent: order.quantity * order.tshirt.price,
            lastOrder: new Date(order.order_date)
          });
        } else {
          const customer = customerMap.get(customerId);
          customer.orders.push(order);
          customer.totalSpent += order.quantity * order.tshirt.price;
          
          const orderDate = new Date(order.order_date);
          if (orderDate > customer.lastOrder) {
            customer.lastOrder = orderDate;
          }
        }
      });
      
      const customerList = Array.from(customerMap.values());
      setCustomers(customerList);
      setFilteredCustomers(customerList);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders(customer.orders);
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString(undefined, options);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = [
      '#3f51b5', '#f50057', '#4caf50', '#ff9800', '#9c27b0',
      '#2196f3', '#ff5722', '#607d8b', '#795548', '#009688'
    ];
    
    // Simple hash function to get consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Customer Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search customers by name or phone"
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

      <Grid container spacing={3}>
        {/* Customer List */}
        <Grid item xs={12} md={selectedCustomer ? 6 : 12}>
          <Paper sx={{ width: '100%', height: '100%' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="All Customers" />
              <Tab label="Recent" />
              <Tab label="Top Spenders" />
            </Tabs>
            
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Total Spent</TableCell>
                    <TableCell>Last Order</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (tabValue === 0 ? filteredCustomers : 
                     tabValue === 1 ? filteredCustomers.sort((a, b) => b.lastOrder - a.lastOrder) :
                     filteredCustomers.sort((a, b) => b.totalSpent - a.totalSpent)
                    ).map(customer => (
                      <TableRow 
                        key={customer.id}
                        hover
                        onClick={() => handleSelectCustomer(customer)}
                        selected={selectedCustomer?.id === customer.id}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getRandomColor(customer.name),
                                marginRight: 2
                              }}
                            >
                              {getInitials(customer.name)}
                            </Avatar>
                            {customer.name}
                          </Box>
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.orders.length}</TableCell>
                        <TableCell>₹{customer.totalSpent}</TableCell>
                        <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                        <TableCell>
                          <IconButton>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Customer Details */}
        {selectedCustomer && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64,
                    bgcolor: getRandomColor(selectedCustomer.name),
                    marginRight: 2
                  }}
                >
                  {getInitials(selectedCustomer.name)}
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedCustomer.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      {selectedCustomer.phone}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Orders</Typography>
                      <Typography variant="h5">{selectedCustomer.orders.length}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Spent</Typography>
                      <Typography variant="h5">₹{selectedCustomer.totalSpent}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Last Order</Typography>
                      <Typography variant="h5">{formatDate(selectedCustomer.lastOrder)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Order History
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {customerOrders.map(order => (
                <Box 
                  key={order.id}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">
                      Order #{order.id}
                    </Typography>
                    <Chip 
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                      color={order.status === 'pending' ? 'warning' : order.status === 'completed' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShippingIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {order.tshirt.design_name} - {order.tshirt.size} ({order.tshirt.color})
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <OrdersIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Quantity: {order.quantity} × ₹{order.tshirt.price} = ₹{order.quantity * order.tshirt.price}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(new Date(order.order_date))}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              <Button 
                variant="outlined" 
                startIcon={<PersonIcon />}
                fullWidth
                sx={{ mt: 2 }}
              >
                View Full Profile
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Customers;
