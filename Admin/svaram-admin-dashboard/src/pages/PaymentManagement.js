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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [revenueStats, setRevenueStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');

  const { getPayments, getSubscriptions, getRevenueAnalytics, processRefund } = useApi();

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, subscriptionsRes, revenueRes] = await Promise.all([
        getPayments(),
        getSubscriptions(), 
        getRevenueAnalytics()
      ]);
      
      setPayments(paymentsRes.data?.payments || []);
      setSubscriptions(subscriptionsRes.data?.subscriptions || []);
      setRevenueStats(revenueRes.data || {});
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      showSnackbar('Failed to fetch payment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefund = async () => {
    try {
      await processRefund(selectedPayment._id, { reason: refundReason });
      showSnackbar('Refund processed successfully');
      setOpenRefundDialog(false);
      setSelectedPayment(null);
      setRefundReason('');
      fetchPaymentData();
    } catch (error) {
      console.error('Refund failed:', error);
      showSnackbar('Failed to process refund', 'error');
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'default';
      default: return 'default';
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payment & Revenue Management
      </Typography>

      {/* Revenue Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h6">
                    ₹{revenueStats.totalRevenue?.toLocaleString() || 0}
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
                <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant="h6">
                    ₹{revenueStats.monthlyRevenue?.toLocaleString() || 0}
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
                <ReceiptIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h6">
                    {payments.length}
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
                <BankIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Subscriptions
                  </Typography>
                  <Typography variant="h6">
                    {subscriptions.filter(s => s.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments Section */}
      <Paper sx={{ mb: 3 }}>
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recent Payments</Typography>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Course/Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.transactionId || payment._id.slice(-8)}</TableCell>
                    <TableCell>{payment.user?.username || 'Unknown'}</TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell>{payment.course?.title || payment.plan?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status}
                        color={getPaymentStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.status === 'completed' && (
                        <Button 
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setOpenRefundDialog(true);
                          }}
                        >
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Subscriptions Section */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6" mb={2}>Active Subscriptions</Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription._id}>
                    <TableCell>{subscription.user?.username || 'Unknown'}</TableCell>
                    <TableCell>{subscription.plan?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={subscription.status}
                        color={getSubscriptionStatusColor(subscription.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>₹{subscription.revenue || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Refund Dialog */}
      <Dialog open={openRefundDialog} onClose={() => setOpenRefundDialog(false)}>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Typography mb={2}>
                Refund ₹{selectedPayment.amount} for {selectedPayment.user?.username}?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Refund Reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRefundDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRefund}
            color="error"
            variant="contained"
            disabled={!refundReason}
          >
            Process Refund
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

export default PaymentManagement;