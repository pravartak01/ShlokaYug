import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  School as EnrollmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('view');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');
  
  // Form state for create/edit enrollment
  const [formData, setFormData] = useState({
    userId: '',
    courseId: '',
    enrollmentType: 'regular',
    paymentStatus: 'pending',
    accessLevel: 'standard'
  });

  const { 
    getEnrollments, 
    getCourses,
    getUsers,
    createEnrollment, 
    updateEnrollment, 
    cancelEnrollment,
    getEnrollmentStats 
  } = useApi();

  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, coursesRes, usersRes] = await Promise.all([
        getEnrollments(),
        getCourses(),
        getUsers()
      ]);
      setEnrollments(enrollmentsRes.data?.enrollments || []);
      setCourses(coursesRes.data?.courses || []);
      setUsers(usersRes.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch enrollment data:', error);
      showSnackbar('Failed to fetch enrollment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateEnrollment = async () => {
    try {
      await createEnrollment(formData);
      showSnackbar('Enrollment created successfully');
      setOpenDialog(false);
      fetchEnrollmentData();
      resetForm();
    } catch (error) {
      console.error('Failed to create enrollment:', error);
      showSnackbar('Failed to create enrollment', 'error');
    }
  };

  const handleUpdateEnrollment = async () => {
    try {
      await updateEnrollment(selectedEnrollment._id, formData);
      showSnackbar('Enrollment updated successfully');
      setOpenDialog(false);
      fetchEnrollmentData();
      resetForm();
    } catch (error) {
      console.error('Failed to update enrollment:', error);
      showSnackbar('Failed to update enrollment', 'error');
    }
  };

  const handleCancelEnrollment = async () => {
    try {
      await cancelEnrollment(selectedEnrollment._id);
      showSnackbar('Enrollment cancelled successfully');
      setOpenDialog(false);
      fetchEnrollmentData();
    } catch (error) {
      console.error('Failed to cancel enrollment:', error);
      showSnackbar('Failed to cancel enrollment', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      courseId: '',
      enrollmentType: 'regular',
      paymentStatus: 'pending',
      accessLevel: 'standard'
    });
  };

  const openEnrollmentDialog = (enrollment, type) => {
    setSelectedEnrollment(enrollment);
    setDialogType(type);
    
    if (type === 'edit' && enrollment) {
      setFormData({
        userId: enrollment.user?._id || '',
        courseId: enrollment.course?._id || '',
        enrollmentType: enrollment.enrollmentType || 'regular',
        paymentStatus: enrollment.paymentStatus || 'pending',
        accessLevel: enrollment.accessLevel || 'standard'
      });
    } else if (type === 'create') {
      resetForm();
    }
    
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      case 'suspended': return 'secondary';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filter === 'all') return true;
    if (filter === 'active') return enrollment.status === 'active';
    if (filter === 'completed') return enrollment.status === 'completed';
    if (filter === 'cancelled') return enrollment.status === 'cancelled';
    if (filter === 'pending-payment') return enrollment.paymentStatus === 'pending';
    return enrollment.enrollmentType === filter;
  });

  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
  const pendingPayments = enrollments.filter(e => e.paymentStatus === 'pending').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Enrollment Management
      </Typography>

      {/* Enrollment Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EnrollmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Enrollments
                  </Typography>
                  <Typography variant="h6">
                    {totalEnrollments}
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
                <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Enrollments
                  </Typography>
                  <Typography variant="h6">
                    {activeEnrollments}
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
                <TrendingIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h6">
                    {completedEnrollments}
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
                <PersonIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Payments
                  </Typography>
                  <Typography variant="h6">
                    {pendingPayments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openEnrollmentDialog(null, 'create')}
        >
          Create Enrollment
        </Button>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter"
          >
            <MenuItem value="all">All Enrollments</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="pending-payment">Pending Payment</MenuItem>
            <MenuItem value="regular">Regular</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
            <MenuItem value="trial">Trial</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Enrollments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Enrollment Date</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEnrollments.map((enrollment) => (
              <TableRow key={enrollment._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {enrollment.user?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {enrollment.user?.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {enrollment.course?.title || 'Unknown Course'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {enrollment.course?.category}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={enrollment.enrollmentType || 'regular'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {new Date(enrollment.enrollmentDate || enrollment.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={enrollment.paymentStatus || 'pending'}
                    color={getPaymentStatusColor(enrollment.paymentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={enrollment.status || 'active'}
                    color={getStatusColor(enrollment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {enrollment.progress || 0}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {enrollment.completedLessons || 0}/{enrollment.totalLessons || 0} lessons
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small"
                      onClick={() => openEnrollmentDialog(enrollment, 'view')}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small"
                      onClick={() => openEnrollmentDialog(enrollment, 'edit')}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {enrollment.status === 'active' && (
                    <Tooltip title="Cancel Enrollment">
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => openEnrollmentDialog(enrollment, 'cancel')}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enrollment Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {(selectedEnrollment || dialogType === 'create') && (
          <>
            <DialogTitle>
              {dialogType === 'view' && `Enrollment Details`}
              {dialogType === 'edit' && `Edit Enrollment`}
              {dialogType === 'create' && `Create Enrollment`}
              {dialogType === 'cancel' && `Cancel Enrollment`}
            </DialogTitle>
            <DialogContent>
              {dialogType === 'cancel' ? (
                <Typography>
                  Are you sure you want to cancel this enrollment? This action will suspend the student's access to the course.
                </Typography>
              ) : dialogType === 'view' ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">Student Information</Typography>
                    <Typography><strong>Name:</strong> {selectedEnrollment?.user?.name}</Typography>
                    <Typography><strong>Email:</strong> {selectedEnrollment?.user?.email}</Typography>
                    <Typography><strong>Phone:</strong> {selectedEnrollment?.user?.phone || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Course Information</Typography>
                    <Typography><strong>Title:</strong> {selectedEnrollment?.course?.title}</Typography>
                    <Typography><strong>Category:</strong> {selectedEnrollment?.course?.category}</Typography>
                    <Typography><strong>Instructor:</strong> {selectedEnrollment?.course?.instructor?.name}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Enrollment Details</Typography>
                    <Typography><strong>Type:</strong> {selectedEnrollment?.enrollmentType}</Typography>
                    <Typography><strong>Status:</strong> {selectedEnrollment?.status}</Typography>
                    <Typography><strong>Payment Status:</strong> {selectedEnrollment?.paymentStatus}</Typography>
                    <Typography><strong>Access Level:</strong> {selectedEnrollment?.accessLevel}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Progress</Typography>
                    <Typography><strong>Progress:</strong> {selectedEnrollment?.progress || 0}%</Typography>
                    <Typography><strong>Lessons Completed:</strong> {selectedEnrollment?.completedLessons || 0}/{selectedEnrollment?.totalLessons || 0}</Typography>
                    <Typography><strong>Last Activity:</strong> {selectedEnrollment?.lastActivity ? new Date(selectedEnrollment.lastActivity).toLocaleDateString() : 'Never'}</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Student</InputLabel>
                      <Select
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        label="Student"
                      >
                        {users.map((user) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        label="Course"
                      >
                        {courses.map((course) => (
                          <MenuItem key={course._id} value={course._id}>
                            {course.title} - {course.category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Enrollment Type</InputLabel>
                      <Select
                        value={formData.enrollmentType}
                        onChange={(e) => setFormData({ ...formData, enrollmentType: e.target.value })}
                        label="Enrollment Type"
                      >
                        <MenuItem value="regular">Regular</MenuItem>
                        <MenuItem value="premium">Premium</MenuItem>
                        <MenuItem value="trial">Trial</MenuItem>
                        <MenuItem value="complimentary">Complimentary</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Status</InputLabel>
                      <Select
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                        label="Payment Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                        <MenuItem value="refunded">Refunded</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Access Level</InputLabel>
                      <Select
                        value={formData.accessLevel}
                        onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                        label="Access Level"
                      >
                        <MenuItem value="basic">Basic</MenuItem>
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="premium">Premium</MenuItem>
                        <MenuItem value="unlimited">Unlimited</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                {(dialogType === 'cancel') ? 'Cancel' : 'Close'}
              </Button>
              {dialogType === 'create' && (
                <Button 
                  onClick={handleCreateEnrollment}
                  color="primary"
                  variant="contained"
                >
                  Create Enrollment
                </Button>
              )}
              {dialogType === 'edit' && (
                <Button 
                  onClick={handleUpdateEnrollment}
                  color="primary"
                  variant="contained"
                >
                  Update Enrollment
                </Button>
              )}
              {dialogType === 'cancel' && (
                <Button 
                  onClick={handleCancelEnrollment}
                  color="error"
                  variant="contained"
                >
                  Cancel Enrollment
                </Button>
              )}
            </DialogActions>
          </>
        )}
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

export default EnrollmentManagement;