import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Store as StoreIcon,
  ColorLens as ThemeIcon,
  Backup as BackupIcon,
  Mail as EmailIcon,
  AccountCircle as ProfileIcon,
  Language as LanguageIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const Settings = () => {
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Inventory Management System',
    address: '123 Commerce Street, Business District',
    phone: '+91 1234567890',
    email: 'contact@inventorysystem.com',
    currency: 'INR'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderConfirmations: true,
    marketingEmails: false,
    stockUpdates: true
  });

  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  
  const handleStoreSettingChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationToggle = (name) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };
  
  const handleSaveSettings = (settingType) => {
    // This would save settings to the backend
    setAlert({
      open: true,
      message: `${settingType} settings saved successfully!`,
      severity: 'success'
    });
  };
  
  const handleBackupData = () => {
    setBackupDialogOpen(false);
    setAlert({
      open: true,
      message: 'System backup initiated successfully!',
      severity: 'success'
    });
  };
  
  const handleCloseAlert = () => {
    setAlert({...alert, open: false});
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 2 }}>
            <List component="nav">
              <ListItem button selected>
                <ListItemIcon>
                  <StoreIcon />
                </ListItemIcon>
                <ListItemText primary="Store Information" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Security" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <ThemeIcon />
                </ListItemIcon>
                <ListItemText primary="Appearance" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <BackupIcon />
                </ListItemIcon>
                <ListItemText primary="Backup & Export" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <ProfileIcon />
                </ListItemIcon>
                <ListItemText primary="User Profile" />
              </ListItem>
            </List>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version: 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Updated: May 23, 2025
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Database: SQLite
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                startIcon={<BackupIcon />}
                onClick={() => setBackupDialogOpen(true)}
              >
                Backup System
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          {/* Store Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StoreIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Store Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="storeName"
                  label="Store Name"
                  value={storeSettings.storeName}
                  onChange={handleStoreSettingChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  value={storeSettings.address}
                  onChange={handleStoreSettingChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="Phone"
                  value={storeSettings.phone}
                  onChange={handleStoreSettingChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  value={storeSettings.email}
                  onChange={handleStoreSettingChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="currency"
                  label="Currency"
                  value={storeSettings.currency}
                  onChange={handleStoreSettingChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('Store')}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>

          {/* Notification Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Notification Settings
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive notifications via email"
                />
                <Switch
                  edge="end"
                  checked={notificationSettings.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Low Stock Alerts" 
                  secondary="Get notified when inventory is running low"
                />
                <Switch
                  edge="end"
                  checked={notificationSettings.lowStockAlerts}
                  onChange={() => handleNotificationToggle('lowStockAlerts')}
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Order Confirmations" 
                  secondary="Receive confirmation when new orders are placed"
                />
                <Switch
                  edge="end"
                  checked={notificationSettings.orderConfirmations}
                  onChange={() => handleNotificationToggle('orderConfirmations')}
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Marketing Emails" 
                  secondary="Receive promotional content and updates"
                />
                <Switch
                  edge="end"
                  checked={notificationSettings.marketingEmails}
                  onChange={() => handleNotificationToggle('marketingEmails')}
                />
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Stock Updates" 
                  secondary="Get notified when inventory is updated"
                />
                <Switch
                  edge="end"
                  checked={notificationSettings.stockUpdates}
                  onChange={() => handleNotificationToggle('stockUpdates')}
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('Notification')}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
          
          {/* Language and Region */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LanguageIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Language and Region
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Language"
                  value="en"
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Date Format"
                  value="dd/mm/yyyy"
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Time Format"
                  value="12"
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="12">12 Hour</option>
                  <option value="24">24 Hour</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Time Zone"
                  value="ist"
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="ist">India Standard Time (IST)</option>
                  <option value="pst">Pacific Standard Time (PST)</option>
                  <option value="est">Eastern Standard Time (EST)</option>
                  <option value="gmt">Greenwich Mean Time (GMT)</option>
                </TextField>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('Language')}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Backup Confirmation Dialog */}
      <Dialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
      >
        <DialogTitle>Backup System Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will create a complete backup of your inventory system data including products, orders, and customer information. The process might take a few minutes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBackupData} variant="contained">
            Start Backup
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

export default Settings;
