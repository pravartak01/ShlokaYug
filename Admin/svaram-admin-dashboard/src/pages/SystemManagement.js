import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Build as MaintenanceIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Speed as PerformanceIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const SystemManagement = () => {
  const [systemHealth, setSystemHealth] = useState({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);
  const [systemLogs, setSystemLogs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  const { 
    getSystemHealth, 
    toggleMaintenanceMode, 
    getSystemLogs,
    getPerformanceMetrics 
  } = useApi();

  useEffect(() => {
    fetchSystemData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      const [healthRes, logsRes, metricsRes] = await Promise.all([
        getSystemHealth(),
        getSystemLogs(),
        getPerformanceMetrics()
      ]);
      
      setSystemHealth(healthRes.data || {});
      setSystemLogs(logsRes.data?.logs || []);
      setPerformanceMetrics(metricsRes.data || {});
    } catch (error) {
      console.error('Failed to fetch system data:', error);
      showSnackbar('Failed to fetch system data', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleToggleMaintenance = async () => {
    try {
      await toggleMaintenanceMode({
        enabled: !maintenanceMode,
        message: maintenanceMessage
      });
      setMaintenanceMode(!maintenanceMode);
      showSnackbar(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
      setOpenMaintenanceDialog(false);
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
      showSnackbar('Failed to toggle maintenance mode', 'error');
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return 'error';
      case 'warn': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          System Management
        </Typography>
        <Button
          variant={maintenanceMode ? "contained" : "outlined"}
          color={maintenanceMode ? "error" : "primary"}
          startIcon={maintenanceMode ? <PauseIcon /> : <MaintenanceIcon />}
          onClick={() => setOpenMaintenanceDialog(true)}
        >
          {maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
        </Button>
      </Box>

      {/* System Health Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SecurityIcon color={getHealthStatusColor(systemHealth.database)} sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Database
                  </Typography>
                  <Typography variant="h6">
                    {systemHealth.database || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StorageIcon color={getHealthStatusColor(systemHealth.storage)} sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Storage
                  </Typography>
                  <Typography variant="h6">
                    {systemHealth.storage || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PerformanceIcon color={getHealthStatusColor(systemHealth.performance)} sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Performance
                  </Typography>
                  <Typography variant="h6">
                    {systemHealth.performance || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <NotificationsIcon color={getHealthStatusColor(systemHealth.notifications)} sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Notifications
                  </Typography>
                  <Typography variant="h6">
                    {systemHealth.notifications || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Performance Metrics</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">CPU Usage</Typography>
                <Typography variant="h6">{performanceMetrics.cpuUsage || 0}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Memory Usage</Typography>
                <Typography variant="h6">{performanceMetrics.memoryUsage || 0}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Active Users</Typography>
                <Typography variant="h6">{performanceMetrics.activeUsers || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">API Requests/min</Typography>
                <Typography variant="h6">{performanceMetrics.apiRequestsPerMinute || 0}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>System Status</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <FormControlLabel
                control={<Switch checked={systemHealth.backupEnabled || false} />}
                label="Automatic Backups"
                disabled
              />
              <FormControlLabel
                control={<Switch checked={systemHealth.monitoringEnabled || false} />}
                label="System Monitoring"
                disabled
              />
              <FormControlLabel
                control={<Switch checked={maintenanceMode} />}
                label="Maintenance Mode"
                disabled
              />
              <FormControlLabel
                control={<Switch checked={systemHealth.securityScanEnabled || false} />}
                label="Security Scanning"
                disabled
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* System Logs */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6" mb={2}>Recent System Logs</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {systemLogs.slice(0, 10).map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.level}
                        color={getLogLevelColor(log.level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.service}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>
                      {log.level === 'error' && (
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <WarningIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Maintenance Mode Dialog */}
      <Dialog open={openMaintenanceDialog} onClose={() => setOpenMaintenanceDialog(false)}>
        <DialogTitle>
          {maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography mb={2}>
              {maintenanceMode 
                ? 'Are you sure you want to disable maintenance mode?' 
                : 'This will prevent users from accessing the platform.'
              }
            </Typography>
            {!maintenanceMode && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Maintenance Message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="We are currently performing scheduled maintenance. Please check back shortly."
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMaintenanceDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleToggleMaintenance}
            color={maintenanceMode ? "primary" : "error"}
            variant="contained"
          >
            {maintenanceMode ? 'Disable' : 'Enable'} Maintenance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemManagement;