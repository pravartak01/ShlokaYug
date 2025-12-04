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
  EmojiEvents as CertificateIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon,
  School as SchoolIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('view');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');
  
  // Form state for create/edit template
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'chandas',
    criteria: {
      minScore: 70,
      completedCourses: [],
      assessmentsPassed: []
    },
    design: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderStyle: 'classic'
    },
    isActive: true
  });

  const { 
    getCertificates, 
    getCertificateTemplates,
    createCertificateTemplate,
    updateCertificateTemplate,
    deleteCertificateTemplate,
    issueCertificate,
    revokeCertificate,
    downloadCertificate
  } = useApi();

  useEffect(() => {
    fetchCertificateData();
  }, []);

  const fetchCertificateData = async () => {
    try {
      setLoading(true);
      const [certificatesRes, templatesRes] = await Promise.all([
        getCertificates(),
        getCertificateTemplates()
      ]);
      setCertificates(certificatesRes.data?.certificates || []);
      setTemplates(templatesRes.data?.templates || []);
    } catch (error) {
      console.error('Failed to fetch certificate data:', error);
      showSnackbar('Failed to fetch certificate data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateTemplate = async () => {
    try {
      await createCertificateTemplate(formData);
      showSnackbar('Certificate template created successfully');
      setOpenDialog(false);
      fetchCertificateData();
      resetForm();
    } catch (error) {
      console.error('Failed to create template:', error);
      showSnackbar('Failed to create template', 'error');
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      await updateCertificateTemplate(selectedCertificate._id, formData);
      showSnackbar('Template updated successfully');
      setOpenDialog(false);
      fetchCertificateData();
      resetForm();
    } catch (error) {
      console.error('Failed to update template:', error);
      showSnackbar('Failed to update template', 'error');
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      await deleteCertificateTemplate(selectedCertificate._id);
      showSnackbar('Template deleted successfully');
      setOpenDialog(false);
      fetchCertificateData();
    } catch (error) {
      console.error('Failed to delete template:', error);
      showSnackbar('Failed to delete template', 'error');
    }
  };

  const handleRevokeCertificate = async (certificateId) => {
    try {
      await revokeCertificate(certificateId);
      showSnackbar('Certificate revoked successfully');
      fetchCertificateData();
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      showSnackbar('Failed to revoke certificate', 'error');
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await downloadCertificate(certificateId);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Certificate downloaded successfully');
    } catch (error) {
      console.error('Failed to download certificate:', error);
      showSnackbar('Failed to download certificate', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'chandas',
      criteria: {
        minScore: 70,
        completedCourses: [],
        assessmentsPassed: []
      },
      design: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        borderStyle: 'classic'
      },
      isActive: true
    });
  };

  const openCertificateDialog = (item, type) => {
    setSelectedCertificate(item);
    setDialogType(type);
    
    if (type === 'edit' && item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'chandas',
        criteria: item.criteria || {
          minScore: 70,
          completedCourses: [],
          assessmentsPassed: []
        },
        design: item.design || {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderStyle: 'classic'
        },
        isActive: item.isActive !== false
      });
    } else if (type === 'create') {
      resetForm();
    }
    
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'revoked': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filter === 'all') return true;
    if (filter === 'active') return cert.status === 'active';
    if (filter === 'revoked') return cert.status === 'revoked';
    return cert.category === filter;
  });

  const totalCertificates = certificates.length;
  const activeCertificates = certificates.filter(c => c.status === 'active').length;
  const revokedCertificates = certificates.filter(c => c.status === 'revoked').length;
  const totalTemplates = templates.length;

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
        Certificate Management
      </Typography>

      {/* Certificate Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CertificateIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Certificates
                  </Typography>
                  <Typography variant="h6">
                    {totalCertificates}
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
                <VerifiedIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Certificates
                  </Typography>
                  <Typography variant="h6">
                    {activeCertificates}
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
                <SchoolIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Templates
                  </Typography>
                  <Typography variant="h6">
                    {totalTemplates}
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
                <TrendingIcon color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Revoked
                  </Typography>
                  <Typography variant="h6">
                    {revokedCertificates}
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
          onClick={() => openCertificateDialog(null, 'create')}
        >
          Create Template
        </Button>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter"
          >
            <MenuItem value="all">All Certificates</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="revoked">Revoked</MenuItem>
            <MenuItem value="chandas">Chandas</MenuItem>
            <MenuItem value="ragas">Ragas</MenuItem>
            <MenuItem value="general">General</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Certificates Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Certificate ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCertificates.map((certificate) => (
              <TableRow key={certificate._id}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {certificate.certificateId || certificate._id.slice(-8)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {certificate.user?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {certificate.user?.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{certificate.template?.name || 'Unknown Template'}</TableCell>
                <TableCell>{certificate.category}</TableCell>
                <TableCell>
                  {new Date(certificate.issuedDate || certificate.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={certificate.status || 'active'}
                    color={getStatusColor(certificate.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small"
                      onClick={() => openCertificateDialog(certificate, 'view')}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton 
                      size="small"
                      onClick={() => handleDownloadCertificate(certificate._id)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  {certificate.status === 'active' && (
                    <Tooltip title="Revoke">
                      <Button 
                        size="small"
                        color="error"
                        onClick={() => handleRevokeCertificate(certificate._id)}
                      >
                        Revoke
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Certificate/Template Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedCertificate && (
          <>
            <DialogTitle>
              {dialogType === 'view' && `Certificate Details`}
              {dialogType === 'edit' && `Edit Template`}
              {dialogType === 'create' && `Create Template`}
              {dialogType === 'delete' && `Delete Template`}
            </DialogTitle>
            <DialogContent>
              {dialogType === 'delete' ? (
                <Typography>
                  Are you sure you want to delete this template? This action cannot be undone.
                </Typography>
              ) : dialogType === 'view' ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">Certificate Information</Typography>
                    <Typography><strong>ID:</strong> {selectedCertificate.certificateId || selectedCertificate._id}</Typography>
                    <Typography><strong>User:</strong> {selectedCertificate.user?.name}</Typography>
                    <Typography><strong>Email:</strong> {selectedCertificate.user?.email}</Typography>
                    <Typography><strong>Category:</strong> {selectedCertificate.category}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Certificate Details</Typography>
                    <Typography><strong>Template:</strong> {selectedCertificate.template?.name}</Typography>
                    <Typography><strong>Issue Date:</strong> {new Date(selectedCertificate.issuedDate || selectedCertificate.createdAt).toLocaleDateString()}</Typography>
                    <Typography><strong>Status:</strong> {selectedCertificate.status || 'active'}</Typography>
                  </Grid>
                  {selectedCertificate.criteria && (
                    <Grid item xs={12}>
                      <Typography variant="h6">Criteria Met</Typography>
                      <Typography><strong>Score Achieved:</strong> {selectedCertificate.achievedScore}%</Typography>
                      <Typography><strong>Courses Completed:</strong> {selectedCertificate.completedCourses?.length || 0}</Typography>
                      <Typography><strong>Assessments Passed:</strong> {selectedCertificate.passedAssessments?.length || 0}</Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Template Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        label="Category"
                      >
                        <MenuItem value="chandas">Chandas</MenuItem>
                        <MenuItem value="ragas">Ragas</MenuItem>
                        <MenuItem value="general">General</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minimum Score (%)"
                      value={formData.criteria.minScore}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        criteria: { 
                          ...formData.criteria, 
                          minScore: parseInt(e.target.value) 
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Design Settings</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="color"
                      label="Background Color"
                      value={formData.design.backgroundColor}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        design: { 
                          ...formData.design, 
                          backgroundColor: e.target.value 
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="color"
                      label="Text Color"
                      value={formData.design.textColor}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        design: { 
                          ...formData.design, 
                          textColor: e.target.value 
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Border Style</InputLabel>
                      <Select
                        value={formData.design.borderStyle}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          design: { 
                            ...formData.design, 
                            borderStyle: e.target.value 
                          }
                        })}
                        label="Border Style"
                      >
                        <MenuItem value="classic">Classic</MenuItem>
                        <MenuItem value="modern">Modern</MenuItem>
                        <MenuItem value="elegant">Elegant</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                {dialogType === 'delete' ? 'Cancel' : 'Close'}
              </Button>
              {dialogType === 'create' && (
                <Button 
                  onClick={handleCreateTemplate}
                  color="primary"
                  variant="contained"
                >
                  Create Template
                </Button>
              )}
              {dialogType === 'edit' && (
                <Button 
                  onClick={handleUpdateTemplate}
                  color="primary"
                  variant="contained"
                >
                  Update Template
                </Button>
              )}
              {dialogType === 'delete' && (
                <Button 
                  onClick={handleDeleteTemplate}
                  color="error"
                  variant="contained"
                >
                  Delete Template
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

export default CertificateManagement;