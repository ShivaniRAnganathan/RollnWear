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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  RestartAlt as ResetIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5008';

const Inventory = () => {
  const [tshirts, setTshirts] = useState([]);
  const [filteredTshirts, setFilteredTshirts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    design_name: '',
    size: '',
    color: '',
    quantity: 0,
    price: 0
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tshirts.filter(
        tshirt => 
          tshirt.design_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tshirt.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tshirt.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTshirts(filtered);
    } else {
      setFilteredTshirts(tshirts);
    }
  }, [searchTerm, tshirts]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tshirts`);
      setTshirts(response.data);
      setFilteredTshirts(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showAlert('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    if (item) {
      setCurrentItem(item);
      setFormData({
        design_name: item.design_name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      });
    } else {
      setFormData({
        design_name: '',
        size: '',
        color: '',
        quantity: 0,
        price: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleResetInventory = async () => {
    if (!window.confirm('Are you sure you want to reset the inventory to its initial state?')) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/reset-inventory`);
      await fetchInventory();
      
      showAlert('Inventory reset successfully', 'success');
    } catch (error) {
      console.error('Error resetting inventory:', error);
      showAlert('Failed to reset inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshInventory = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/update-stock`);
      await fetchInventory();
      
      showAlert('Inventory refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing inventory:', error);
      showAlert('Failed to refresh inventory', 'error');
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

  // Size options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  
  // Color options
  const colorOptions = ['Black', 'White', 'Navy', 'Red', 'Grey', 'Blue', 'Green'];

  if (loading && tshirts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory Management
      </Typography>

      {/* Action Buttons and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('add')}
              >
                Add Item
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<RefreshIcon />}
                onClick={handleRefreshInventory}
              >
                Refresh
              </Button>
              <Button 
                variant="outlined" 
                color="warning" 
                startIcon={<ResetIcon />}
                onClick={handleResetInventory}
              >
                Reset
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by design, size, or color"
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

      {/* Inventory Table */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="inventory table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Design</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Color</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : filteredTshirts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTshirts.map((tshirt) => (
                  <TableRow 
                    key={tshirt.id}
                    sx={{
                      backgroundColor: tshirt.quantity <= 2 ? '#fff4e5' : 'inherit'
                    }}
                  >
                    <TableCell>{tshirt.design_name}</TableCell>
                    <TableCell>{tshirt.size}</TableCell>
                    <TableCell>{tshirt.color}</TableCell>
                    <TableCell>₹{tshirt.price}</TableCell>
                    <TableCell>
                      <Typography 
                        color={tshirt.quantity <= 2 ? 'error' : 'inherit'}
                        fontWeight={tshirt.quantity <= 2 ? 'bold' : 'normal'}
                      >
                        {tshirt.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {tshirt.quantity === 0 ? (
                        <Chip 
                          label="Out of Stock" 
                          color="error" 
                          size="small" 
                          icon={<WarningIcon />} 
                        />
                      ) : tshirt.quantity <= 5 ? (
                        <Chip 
                          label="Low Stock" 
                          color="warning" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label="In Stock" 
                          color="success" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleOpenDialog('edit', tshirt)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleOpenDialog('delete', tshirt)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Inventory Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Inventory Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">Total Items</Typography>
              <Typography variant="h4">{tshirts.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">Low Stock Items</Typography>
              <Typography variant="h4">{tshirts.filter(item => item.quantity <= 5).length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">Unique Designs</Typography>
              <Typography variant="h4">
                {new Set(tshirts.map(item => item.design_name)).size}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog for Add/Edit/Delete */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === 'add' ? 'Add New Item' : 
           dialogType === 'edit' ? 'Edit Item' : 'Delete Item'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <DialogContentText>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </DialogContentText>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="design_name"
                    label="Design Name"
                    value={formData.design_name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="size"
                    label="Size"
                    select
                    value={formData.size}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  >
                    {sizeOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="color"
                    label="Color"
                    select
                    value={formData.color}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  >
                    {colorOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="quantity"
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color={dialogType === 'delete' ? 'error' : 'primary'}
            onClick={handleCloseDialog}
          >
            {dialogType === 'add' ? 'Add' : 
             dialogType === 'edit' ? 'Save' : 'Delete'}
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

export default Inventory;
