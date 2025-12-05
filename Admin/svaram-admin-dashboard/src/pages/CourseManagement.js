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
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  School as CourseIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  ArticleOutlined as DraftIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    title: 'Introduction to Sanskrit Pronunciation',
    instructor: 'Dr. Priya Sharma',
    category: 'Basics',
    enrollments: 1234,
    rating: 4.8,
    duration: '8 weeks',
    published: true,
    createdAt: '2024-01-15',
    description: 'Learn the fundamentals of Sanskrit pronunciation and basic grammar.',
    price: 2999,
    level: 'Beginner'
  },
  {
    id: 2,
    title: 'Advanced Vedic Chanting',
    instructor: 'Guru Ramesh Acharya',
    category: 'Advanced',
    enrollments: 567,
    rating: 4.9,
    duration: '12 weeks',
    published: true,
    createdAt: '2024-02-01',
    description: 'Master the art of Vedic chanting with proper intonation.',
    price: 4999,
    level: 'Advanced'
  },
  {
    id: 3,
    title: 'Sanskrit Literature Analysis',
    instructor: 'Prof. Meera Devi',
    category: 'Literature',
    enrollments: 890,
    rating: 4.7,
    duration: '10 weeks',
    published: false,
    createdAt: '2024-03-10',
    description: 'Deep dive into classical Sanskrit literature and texts.',
    price: 3999,
    level: 'Intermediate'
  }
];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('view'); // 'view', 'edit', 'delete'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');
  const [courseStats, setCourseStats] = useState({});

  const { 
    getAllCourses, 
    updateCourse, 
    deleteCourse, 
    publishCourse, 
    unpublishCourse,
    getCourseAnalytics 
  } = useApi();

  // Helper function to show snackbar messages
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCourses(mockCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        showSnackbar('Error loading courses', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const refreshCourses = async () => {
    try {
      setLoading(true);
      const [coursesRes, analyticsRes] = await Promise.all([
        getAllCourses(),
        getCourseAnalytics()
      ]);
      
      setCourses(coursesRes.data?.courses || mockCourses);
      setCourseStats(analyticsRes.data || {});
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      showSnackbar('Failed to fetch courses', 'error');
      // Fallback to mock data
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (course) => {
    try {
      if (course.published) {
        await unpublishCourse(course._id);
        showSnackbar('Course unpublished successfully');
      } else {
        await publishCourse(course._id);
        showSnackbar('Course published successfully');
      }
      refreshCourses();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      showSnackbar('Failed to update course status', 'error');
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(selectedCourse._id);
      showSnackbar('Course deleted successfully');
      setOpenDialog(false);
      refreshCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      showSnackbar('Failed to delete course', 'error');
    }
  };

  const openCourseDialog = (course, type) => {
    setSelectedCourse(course);
    setDialogType(type);
    setOpenDialog(true);
  };

  const getStatusColor = (published, status) => {
    if (!published) return 'default';
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const filteredCourses = courses.filter(course => {
    switch (filter) {
      case 'published': return course.published;
      case 'draft': return !course.published;
      case 'active': return course.published && course.status === 'active';
      case 'archived': return course.status === 'archived';
      default: return true;
    }
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Management
      </Typography>

      {/* Course Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CourseIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Draft Courses
                  </Typography>
                  <Typography variant="h6">
                    {courses.length}
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
                <PublishIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Published
                  </Typography>
                  <Typography variant="h6">
                    {courses.filter(c => c.published).length}
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
                <DraftIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Drafts
                  </Typography>
                  <Typography variant="h6">
                    {courses.filter(c => !c.published).length}
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
                <AnalyticsIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Enrollments
                  </Typography>
                  <Typography variant="h6">
                    {courseStats.totalEnrollments || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter Courses</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter Courses"
          >
            <MenuItem value="all">All Courses</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Drafts</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Courses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Title</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Enrollments</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.description?.substring(0, 50)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{course.instructor?.username || 'Unknown'}</TableCell>
                <TableCell>
                  <Chip label={course.category} size="small" />
                </TableCell>
                <TableCell>{course.enrollmentCount || 0}</TableCell>
                <TableCell>
                  <Chip 
                    label={course.published ? 'Published' : 'Draft'}
                    color={getStatusColor(course.published, course.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small"
                      onClick={() => openCourseDialog(course, 'view')}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Course">
                    <IconButton 
                      size="small"
                      onClick={() => openCourseDialog(course, 'edit')}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={course.published ? "Unpublish" : "Publish"}>
                    <IconButton 
                      size="small"
                      color={course.published ? "warning" : "success"}
                      onClick={() => handlePublishToggle(course)}
                    >
                      {course.published ? <DraftIcon /> : <PublishIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Course">
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => openCourseDialog(course, 'delete')}
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

      {/* Course Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              {dialogType === 'view' && 'Course Details'}
              {dialogType === 'edit' && 'Edit Course'}
              {dialogType === 'delete' && 'Delete Course'}
            </DialogTitle>
            <DialogContent>
              {dialogType === 'delete' ? (
                <Typography>
                  Are you sure you want to delete "{selectedCourse.title}"? This action cannot be undone.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">Course Information</Typography>
                    <Typography><strong>Title:</strong> {selectedCourse.title}</Typography>
                    <Typography><strong>Instructor:</strong> {selectedCourse.instructor?.username}</Typography>
                    <Typography><strong>Category:</strong> {selectedCourse.category}</Typography>
                    <Typography><strong>Level:</strong> {selectedCourse.level}</Typography>
                    <Typography><strong>Price:</strong> ₹{selectedCourse.price}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Description</Typography>
                    <Typography>{selectedCourse.description}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Statistics</Typography>
                    <Typography><strong>Enrollments:</strong> {selectedCourse.enrollmentCount || 0}</Typography>
                    <Typography><strong>Rating:</strong> {selectedCourse.rating || 'Not rated'}</Typography>
                    <Typography><strong>Duration:</strong> {selectedCourse.duration || 'Not specified'}</Typography>
                  </Grid>
                  {dialogType === 'edit' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Admin Notes"
                        placeholder="Add any administrative notes about this course..."
                      />
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                {dialogType === 'delete' ? 'Cancel' : 'Close'}
              </Button>
              {dialogType === 'delete' && (
                <Button 
                  onClick={handleDeleteCourse}
                  color="error"
                  variant="contained"
                >
                  Delete Course
                </Button>
              )}
              {dialogType === 'edit' && (
                <Button 
                  variant="contained"
                  color="primary"
                >
                  Save Changes
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

export default CourseManagement;