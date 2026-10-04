import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  PieChart,
  LineChart
} from '@mui/x-charts';
import {
  Print as PrintIcon,
  FileDownload as DownloadIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5008';

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState('monthly');
  const [reportData, setReportData] = useState({
    inventoryByDesign: [],
    ordersByDate: [],
    topProducts: [],
    salesByCategory: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    processReportData();
  }, [inventory, orders, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tshirts`),
        axios.get(`${API_BASE_URL}/api/orders`)
      ]);
      
      setInventory(inventoryRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = () => {
    // Process inventory by design
    const inventoryByDesign = inventory.reduce((acc, item) => {
      const existingIndex = acc.findIndex(i => i.design === item.design_name);
      if (existingIndex >= 0) {
        acc[existingIndex].quantity += item.quantity;
      } else {
        acc.push({ design: item.design_name, quantity: item.quantity });
      }
      return acc;
    }, []);
    
    // Process orders by date
    const ordersByDate = {};
    const now = new Date();
    
    // Initialize date buckets based on time range
    if (timeRange === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ordersByDate[dateStr] = 0;
      }
    } else if (timeRange === 'monthly') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ordersByDate[dateStr] = 0;
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        ordersByDate[dateStr] = 0;
      }
    }
    
    // Fill in order data
    orders.forEach(order => {
      const orderDate = new Date(order.order_date);
      let dateStr;
      
      if (timeRange === 'weekly' || timeRange === 'monthly') {
        dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (ordersByDate[dateStr] !== undefined) {
        ordersByDate[dateStr] += order.quantity * order.tshirt.price;
      }
    });
    
    // Convert to array format for charts
    const orderDateData = Object.entries(ordersByDate).map(([date, amount]) => ({
      date,
      amount
    }));
    
    // Process top selling products
    const topProducts = orders.reduce((acc, order) => {
      const design = order.tshirt.design_name;
      const existingIndex = acc.findIndex(item => item.design === design);
      
      if (existingIndex >= 0) {
        acc[existingIndex].quantity += order.quantity;
        acc[existingIndex].revenue += order.quantity * order.tshirt.price;
      } else {
        acc.push({
          design,
          quantity: order.quantity,
          revenue: order.quantity * order.tshirt.price
        });
      }
      
      return acc;
    }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    // Process sales by category (color in this case)
    const salesByCategory = orders.reduce((acc, order) => {
      const color = order.tshirt.color;
      const existingIndex = acc.findIndex(item => item.category === color);
      
      if (existingIndex >= 0) {
        acc[existingIndex].sales += order.quantity * order.tshirt.price;
      } else {
        acc.push({
          category: color,
          sales: order.quantity * order.tshirt.price
        });
      }
      
      return acc;
    }, []);
    
    setReportData({
      inventoryByDesign,
      ordersByDate: orderDateData,
      topProducts,
      salesByCategory
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // This would be implemented to export data to CSV or PDF
    alert('Export functionality would be implemented here');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Reports & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Time Range"
            value={timeRange}
            onChange={handleTimeRangeChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="weekly">Last 7 Days</MenuItem>
            <MenuItem value="monthly">Last 30 Days</MenuItem>
            <MenuItem value="yearly">Last 12 Months</MenuItem>
          </TextField>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Sales Overview" />
          <Tab label="Inventory Analysis" />
          <Tab label="Customer Insights" />
          <Tab label="Performance" />
        </Tabs>
      </Paper>

      {/* Sales Overview Tab */}
      {tabValue === 0 && (
        <Box>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'primary.main' }}>
                    {orders.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'primary.main' }}>
                    {orders.reduce((sum, order) => sum + order.quantity, 0)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Items Sold
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'primary.main' }}>
                    ₹{orders.reduce((sum, order) => sum + (order.quantity * order.tshirt.price), 0)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Revenue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'primary.main' }}>
                    ₹{Math.round(orders.reduce((sum, order) => sum + (order.quantity * order.tshirt.price), 0) / 
                    (orders.length || 1))}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Average Order Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Sales Over Time Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Over Time
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              {reportData.ordersByDate.length > 0 && (
                <LineChart
                  series={[
                    {
                      data: reportData.ordersByDate.map(item => item.amount),
                      label: 'Revenue',
                      color: '#3f51b5'
                    }
                  ]}
                  xAxis={[{
                    scaleType: 'band',
                    data: reportData.ordersByDate.map(item => item.date)
                  }]}
                  height={300}
                />
              )}
            </Box>
          </Paper>
          
          {/* Top Products and Sales by Category */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Top Selling Products
                </Typography>
                {reportData.topProducts.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.topProducts.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>{product.design}</TableCell>
                            <TableCell align="right">{product.quantity}</TableCell>
                            <TableCell align="right">₹{product.revenue}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography>No sales data available</Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Sales by Category
                </Typography>
                {reportData.salesByCategory.length > 0 ? (
                  <Box sx={{ height: 300, mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <PieChart
                      series={[
                        {
                          data: reportData.salesByCategory.map((item, index) => ({
                            id: index,
                            value: item.sales,
                            label: item.category
                          })),
                          innerRadius: 30,
                          outerRadius: 100,
                          paddingAngle: 2,
                          cornerRadius: 5,
                        },
                      ]}
                      height={300}
                      width={400}
                    />
                  </Box>
                ) : (
                  <Typography>No category data available</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Inventory Analysis Tab */}
      {tabValue === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inventory by Design
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              {reportData.inventoryByDesign.length > 0 && (
                <BarChart
                  series={[
                    { data: reportData.inventoryByDesign.map(item => item.quantity), label: 'Quantity' }
                  ]}
                  xAxis={[{ 
                    data: reportData.inventoryByDesign.map(item => item.design),
                    scaleType: 'band',
                  }]}
                  height={400}
                />
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Status
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Design</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell align="right">Available</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.design_name}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₹{item.price}</TableCell>
                      <TableCell>
                        {item.quantity === 0 ? 'Out of Stock' : 
                         item.quantity <= 5 ? 'Low Stock' : 'In Stock'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Customer Insights Tab */}
      {tabValue === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {new Set(orders.map(order => `${order.customer_name}-${order.customer_phone}`)).size}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Total Customers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {Math.round(orders.reduce((acc, order) => acc + 1, 0) / 
                       new Set(orders.map(order => `${order.customer_name}-${order.customer_phone}`)).size)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Avg. Orders per Customer
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {new Set(orders.filter(order => new Date(order.order_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                       .map(order => `${order.customer_name}-${order.customer_phone}`)).size}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      New Customers (30d)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      ₹{Math.round(orders.reduce((sum, order) => sum + (order.quantity * order.tshirt.price), 0) / 
                       new Set(orders.map(order => `${order.customer_name}-${order.customer_phone}`)).size)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Avg. Customer Spend
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Customers
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell>Last Order</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(orders.reduce((acc, order) => {
                    const customerId = `${order.customer_name}-${order.customer_phone}`;
                    if (!acc[customerId]) {
                      acc[customerId] = {
                        name: order.customer_name,
                        phone: order.customer_phone,
                        orders: 1,
                        spent: order.quantity * order.tshirt.price,
                        lastOrder: new Date(order.order_date)
                      };
                    } else {
                      acc[customerId].orders += 1;
                      acc[customerId].spent += order.quantity * order.tshirt.price;
                      const orderDate = new Date(order.order_date);
                      if (orderDate > acc[customerId].lastOrder) {
                        acc[customerId].lastOrder = orderDate;
                      }
                    }
                    return acc;
                  }, {}))
                  .sort((a, b) => b.spent - a.spent)
                  .slice(0, 10)
                  .map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell align="right">{customer.orders}</TableCell>
                      <TableCell align="right">₹{customer.spent}</TableCell>
                      <TableCell>
                        {customer.lastOrder.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Performance Tab */}
      {tabValue === 3 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Total Inventory
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {inventory.filter(item => item.quantity <= 5).length}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Low Stock Items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Inventory Value
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Performance by Month
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              {/* This would be a chart showing monthly performance */}
              <BarChart
                series={[
                  {
                    data: [65000, 72000, 58000, 63000, 81000, 95000],
                    label: 'Revenue',
                    color: '#3f51b5'
                  }
                ]}
                xAxis={[{
                  scaleType: 'band',
                  data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                }]}
                height={400}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
