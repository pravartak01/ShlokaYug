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
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const GuruManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { getAllGurus, getGuruApplications, reviewGuruApplication } = useApi();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Use getAllGurus to show all gurus (pending, approved, rejected)
      const response = await getAllGurus();
      if (response.success && response.data) {
        setApplications(response.data.gurus || []);
      } else {
        // Fallback to pending only if getAllGurus fails
        const fallbackResponse = await getGuruApplications();
        setApplications(fallbackResponse.data?.applications || []);
      }
    } catch (error) {
      console.error('Failed to fetch guru data:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId, status, feedback = '') => {
    try {
      await reviewGuruApplication(applicationId, { 
        status, 
        feedback: feedback || `Application ${status} by admin` 
      });
      fetchApplications(); // Refresh the data
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to review application:', error);
      // You could add error notification here
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Guru Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Applications
                  </Typography>
                  <Typography variant="h6">
                    {applications.filter(a => a.applicationStatus === 'submitted').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Approved Gurus
                  </Typography>
                  <Typography variant="h6">
                    {applications.filter(a => a.applicationStatus === 'approved').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant</TableCell>
              <TableCell>Qualifications</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2 }}>
                      {application.name?.charAt(0) || 'G'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {application.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {application.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {(application.degrees || []).slice(0, 2).map((qual, index) => (
                    <Chip key={index} label={qual} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                  {(application.specializations || []).slice(0, 1).map((spec, index) => (
                    <Chip key={`spec-${index}`} label={spec} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{application.experience}</TableCell>
                <TableCell>
                  <Chip 
                    label={application.applicationStatus || 'unknown'}
                    color={
                      application.applicationStatus === 'approved' ? 'success' :
                      application.applicationStatus === 'rejected' ? 'error' : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(application.applicationDate || application.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => { setSelectedApplication(application); setOpenDialog(true); }}>
                    <ViewIcon />
                  </IconButton>
                  {application.applicationStatus === 'submitted' && (
                    <>
                      <IconButton 
                        size="small"
                        color="success"
                        onClick={() => handleReview(application.id, 'approved')}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => handleReview(application.id, 'rejected')}
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedApplication && (
          <>
            <DialogTitle>Review Guru Application</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Applicant Details</Typography>
                  <Typography><strong>Name:</strong> {selectedApplication.name || 'Unknown'}</Typography>
                  <Typography><strong>Email:</strong> {selectedApplication.email || 'No email'}</Typography>
                  <Typography><strong>Username:</strong> {selectedApplication.username || 'No username'}</Typography>
                  <Typography><strong>Phone:</strong> {selectedApplication.phone || 'No phone'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Qualifications</Typography>
                  {(selectedApplication.degrees || []).map((qual, index) => (
                    <Typography key={index}>• {qual}</Typography>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Specializations</Typography>
                  {(selectedApplication.specializations || []).map((spec, index) => (
                    <Typography key={index}>• {spec}</Typography>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Experience</Typography>
                  <Typography>{selectedApplication.experience} years</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Status</Typography>
                  <Chip 
                    label={selectedApplication.applicationStatus || 'unknown'}
                    color={
                      selectedApplication.applicationStatus === 'approved' ? 'success' :
                      selectedApplication.applicationStatus === 'rejected' ? 'error' : 'warning'
                    }
                  />
                  {selectedApplication.isApproved && (
                    <Chip label="Account Approved" color="success" sx={{ ml: 1 }} />
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              {selectedApplication.applicationStatus === 'submitted' && (
                <>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => handleReview(selectedApplication.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => handleReview(selectedApplication.id, 'approved')}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GuruManagement;