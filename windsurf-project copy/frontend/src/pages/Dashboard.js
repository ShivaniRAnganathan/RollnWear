import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5008';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0
  });
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch inventory and orders
        const [inventoryRes, ordersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/tshirts`),
          axios.get(`${API_BASE_URL}/api/orders`)
        ]);
        
        setInventory(inventoryRes.data);
        setOrders(ordersRes.data);
        
        // Calculate stats
        const totalProducts = inventoryRes.data.reduce((total, item) => total + item.quantity, 0);
        const totalOrders = ordersRes.data.length;
        
        // Get unique customers
        const uniqueCustomers = new Set();
        ordersRes.data.forEach(order => uniqueCustomers.add(order.customer_name));
        
        // Calculate revenue
        const revenue = ordersRes.data.reduce((total, order) => {
          return total + (order.quantity * order.tshirt.price);
        }, 0);
        
        setStats({
          totalProducts,
          totalOrders,
          totalCustomers: uniqueCustomers.size,
          revenue
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Prepare chart data
  const inventoryByDesign = inventory.reduce((acc, item) => {
    const existingIndex = acc.findIndex(i => i.design === item.design_name);
    if (existingIndex >= 0) {
      acc[existingIndex].quantity += item.quantity;
    } else {
      acc.push({ design: item.design_name, quantity: item.quantity });
    }
    return acc;
  }, []);
  
  const topSellingProducts = orders.reduce((acc, order) => {
    const design = order.tshirt.design_name;
    const existingIndex = acc.findIndex(item => item.design === design);
    
    if (existingIndex >= 0) {
      acc[existingIndex].quantity += order.quantity;
    } else {
      acc.push({ design, quantity: order.quantity });
    }
    
    return acc;
  }, []).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#e3f2fd'
            }}
          >
            <InventoryIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {stats.totalProducts}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Products
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#e8f5e9'
            }}
          >
            <OrdersIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {stats.totalOrders}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Orders
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#fff8e1'
            }}
          >
            <CustomersIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {stats.totalCustomers}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customers
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#fce4ec'
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              ₹{stats.revenue}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Revenue
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inventory by Design
            </Typography>
            {inventoryByDesign.length > 0 ? (
              <Box sx={{ height: 300, mt: 2 }}>
                <BarChart
                  series={[
                    { data: inventoryByDesign.map(item => item.quantity), label: 'Quantity' }
                  ]}
                  xAxis={[{ 
                    data: inventoryByDesign.map(item => item.design),
                    scaleType: 'band',
                  }]}
                  height={300}
                />
              </Box>
            ) : (
              <Typography>No inventory data available</Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            {topSellingProducts.length > 0 ? (
              <Box sx={{ height: 300, mt: 2, display: 'flex', justifyContent: 'center' }}>
                <PieChart
                  series={[
                    {
                      data: topSellingProducts.map((item, index) => ({
                        id: index,
                        value: item.quantity,
                        label: item.design
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
              <Typography>No sales data available</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" href="/inventory">
            Manage Inventory
          </Button>
          <Button variant="contained" color="secondary" href="/orders">
            View Orders
          </Button>
          <Button variant="outlined" color="primary" href="/reports">
            Generate Reports
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
