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
  Quiz as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const AssessmentManagement = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('view');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');
  
  // Form state for create/edit assessment
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'chandas',
    difficulty: 'beginner',
    timeLimit: 30,
    passScore: 70,
    isActive: true,
    questions: []
  });

  const { 
    getAssessments, 
    createAssessment, 
    updateAssessment, 
    deleteAssessment,
    getAssessmentStats 
  } = useApi();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await getAssessments();
      setAssessments(response.data?.assessments || []);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      showSnackbar('Failed to fetch assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateAssessment = async () => {
    try {
      await createAssessment(formData);
      showSnackbar('Assessment created successfully');
      setOpenDialog(false);
      fetchAssessments();
      resetForm();
    } catch (error) {
      console.error('Failed to create assessment:', error);
      showSnackbar('Failed to create assessment', 'error');
    }
  };

  const handleUpdateAssessment = async () => {
    try {
      await updateAssessment(selectedAssessment._id, formData);
      showSnackbar('Assessment updated successfully');
      setOpenDialog(false);
      fetchAssessments();
      resetForm();
    } catch (error) {
      console.error('Failed to update assessment:', error);
      showSnackbar('Failed to update assessment', 'error');
    }
  };

  const handleDeleteAssessment = async () => {
    try {
      await deleteAssessment(selectedAssessment._id);
      showSnackbar('Assessment deleted successfully');
      setOpenDialog(false);
      fetchAssessments();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      showSnackbar('Failed to delete assessment', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'chandas',
      difficulty: 'beginner',
      timeLimit: 30,
      passScore: 70,
      isActive: true,
      questions: []
    });
  };

  const openAssessmentDialog = (assessment, type) => {
    setSelectedAssessment(assessment);
    setDialogType(type);
    
    if (type === 'edit' && assessment) {
      setFormData({
        title: assessment.title || '',
        description: assessment.description || '',
        category: assessment.category || 'chandas',
        difficulty: assessment.difficulty || 'beginner',
        timeLimit: assessment.timeLimit || 30,
        passScore: assessment.passScore || 70,
        isActive: assessment.isActive !== false,
        questions: assessment.questions || []
      });
    } else if (type === 'create') {
      resetForm();
    }
    
    setOpenDialog(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (filter === 'all') return true;
    if (filter === 'active') return assessment.isActive;
    if (filter === 'inactive') return !assessment.isActive;
    return assessment.category === filter;
  });

  const totalAssessments = assessments.length;
  const activeAssessments = assessments.filter(a => a.isActive).length;
  const totalAttempts = assessments.reduce((sum, a) => sum + (a.attemptCount || 0), 0);
  const averageScore = assessments.reduce((sum, a) => sum + (a.averageScore || 0), 0) / assessments.length || 0;

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
        Assessment Management
      </Typography>

      {/* Assessment Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Assessments
                  </Typography>
                  <Typography variant="h6">
                    {totalAssessments}
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
                <SchoolIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Assessments
                  </Typography>
                  <Typography variant="h6">
                    {activeAssessments}
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
                <TrendingIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Attempts
                  </Typography>
                  <Typography variant="h6">
                    {totalAttempts.toLocaleString()}
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
                <AssignmentIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant="h6">
                    {averageScore.toFixed(1)}%
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
          onClick={() => openAssessmentDialog(null, 'create')}
        >
          Create Assessment
        </Button>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="chandas">Chandas</MenuItem>
            <MenuItem value="ragas">Ragas</MenuItem>
            <MenuItem value="general">General</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Assessments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Time Limit</TableCell>
              <TableCell>Pass Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssessments.map((assessment) => (
              <TableRow key={assessment._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {assessment.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Attempts: {assessment.attemptCount || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{assessment.category}</TableCell>
                <TableCell>
                  <Chip 
                    label={assessment.difficulty}
                    color={getDifficultyColor(assessment.difficulty)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{assessment.questions?.length || 0}</TableCell>
                <TableCell>{assessment.timeLimit} mins</TableCell>
                <TableCell>{assessment.passScore}%</TableCell>
                <TableCell>
                  <Chip 
                    label={assessment.isActive ? 'Active' : 'Inactive'}
                    color={assessment.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small"
                      onClick={() => openAssessmentDialog(assessment, 'view')}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small"
                      onClick={() => openAssessmentDialog(assessment, 'edit')}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => openAssessmentDialog(assessment, 'delete')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Assessment Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedAssessment && (
          <>
            <DialogTitle>
              {dialogType === 'view' && `Assessment Details`}
              {dialogType === 'edit' && `Edit Assessment`}
              {dialogType === 'create' && `Create Assessment`}
              {dialogType === 'delete' && `Delete Assessment`}
            </DialogTitle>
            <DialogContent>
              {dialogType === 'delete' ? (
                <Typography>
                  Are you sure you want to delete "{selectedAssessment.title}"? This action cannot be undone.
                </Typography>
              ) : dialogType === 'view' ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">{selectedAssessment.title}</Typography>
                    <Typography color="textSecondary">{selectedAssessment.description}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Category:</strong> {selectedAssessment.category}</Typography>
                    <Typography><strong>Difficulty:</strong> {selectedAssessment.difficulty}</Typography>
                    <Typography><strong>Time Limit:</strong> {selectedAssessment.timeLimit} minutes</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Pass Score:</strong> {selectedAssessment.passScore}%</Typography>
                    <Typography><strong>Questions:</strong> {selectedAssessment.questions?.length || 0}</Typography>
                    <Typography><strong>Status:</strong> {selectedAssessment.isActive ? 'Active' : 'Inactive'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2 }}>Statistics</Typography>
                    <Typography><strong>Total Attempts:</strong> {selectedAssessment.attemptCount || 0}</Typography>
                    <Typography><strong>Average Score:</strong> {selectedAssessment.averageScore || 0}%</Typography>
                    <Typography><strong>Pass Rate:</strong> {selectedAssessment.passRate || 0}%</Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    <FormControl fullWidth>
                      <InputLabel>Difficulty</InputLabel>
                      <Select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        label="Difficulty"
                      >
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Time Limit (minutes)"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Pass Score (%)"
                      value={formData.passScore}
                      onChange={(e) => setFormData({ ...formData, passScore: parseInt(e.target.value) })}
                    />
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
                  onClick={handleCreateAssessment}
                  color="primary"
                  variant="contained"
                >
                  Create Assessment
                </Button>
              )}
              {dialogType === 'edit' && (
                <Button 
                  onClick={handleUpdateAssessment}
                  color="primary"
                  variant="contained"
                >
                  Update Assessment
                </Button>
              )}
              {dialogType === 'delete' && (
                <Button 
                  onClick={handleDeleteAssessment}
                  color="error"
                  variant="contained"
                >
                  Delete Assessment
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

export default AssessmentManagement;