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
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  PlayArrow as VideoIcon,
  Visibility as ViewIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('view');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');
  const [videoType, setVideoType] = useState('videos'); // 'videos' or 'shorts'

  const { 
    getVideos, 
    getShorts, 
    moderateVideo, 
    deleteVideo,
    getVideoAnalytics 
  } = useApi();

  useEffect(() => {
    fetchVideoData();
  }, [videoType]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      if (videoType === 'videos') {
        const response = await getVideos();
        setVideos(response.data?.videos || []);
      } else {
        const response = await getShorts();
        setShorts(response.data?.shorts || []);
      }
    } catch (error) {
      console.error('Failed to fetch video data:', error);
      showSnackbar('Failed to fetch video data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleModerateVideo = async (videoId, action) => {
    try {
      await moderateVideo(videoId, action);
      showSnackbar(`Video ${action}d successfully`);
      fetchVideoData();
    } catch (error) {
      console.error('Failed to moderate video:', error);
      showSnackbar('Failed to moderate video', 'error');
    }
  };

  const handleDeleteVideo = async () => {
    try {
      await deleteVideo(selectedVideo._id);
      showSnackbar('Video deleted successfully');
      setOpenDialog(false);
      fetchVideoData();
    } catch (error) {
      console.error('Failed to delete video:', error);
      showSnackbar('Failed to delete video', 'error');
    }
  };

  const openVideoDialog = (video, type) => {
    setSelectedVideo(video);
    setDialogType(type);
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'pending': return 'warning';
      case 'flagged': return 'error';
      case 'private': return 'default';
      default: return 'default';
    }
  };

  const currentData = videoType === 'videos' ? videos : shorts;
  const filteredData = currentData.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const totalViews = currentData.reduce((sum, item) => sum + (item.viewCount || 0), 0);
  const totalLikes = currentData.reduce((sum, item) => sum + (item.likeCount || 0), 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Video & Content Management
      </Typography>

      {/* Video Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <VideoIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Videos
                  </Typography>
                  <Typography variant="h6">
                    {videos.length}
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
                <VideocamIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Shorts
                  </Typography>
                  <Typography variant="h6">
                    {shorts.length}
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
                <TrendingIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Views
                  </Typography>
                  <Typography variant="h6">
                    {totalViews.toLocaleString()}
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
                <FlagIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Flagged Content
                  </Typography>
                  <Typography variant="h6">
                    {currentData.filter(item => item.status === 'flagged').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Content Type</InputLabel>
          <Select
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
            label="Content Type"
          >
            <MenuItem value="videos">Videos</MenuItem>
            <MenuItem value="shorts">Shorts</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="flagged">Flagged</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Videos/Shorts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Likes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.title || 'Untitled'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Duration: {item.duration || 'Unknown'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{item.creator?.username || 'Unknown'}</TableCell>
                <TableCell>{(item.viewCount || 0).toLocaleString()}</TableCell>
                <TableCell>{(item.likeCount || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.status || 'published'}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small"
                      onClick={() => openVideoDialog(item, 'view')}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {item.status === 'flagged' && (
                    <>
                      <Tooltip title="Approve">
                        <Button 
                          size="small"
                          color="success"
                          onClick={() => handleModerateVideo(item._id, 'approve')}
                        >
                          Approve
                        </Button>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <Button 
                          size="small"
                          color="error"
                          onClick={() => handleModerateVideo(item._id, 'reject')}
                        >
                          Reject
                        </Button>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => openVideoDialog(item, 'delete')}
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

      {/* Video Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedVideo && (
          <>
            <DialogTitle>
              {dialogType === 'view' && `${videoType} Details`}
              {dialogType === 'delete' && `Delete ${videoType}`}
            </DialogTitle>
            <DialogContent>
              {dialogType === 'delete' ? (
                <Typography>
                  Are you sure you want to delete "{selectedVideo.title}"? This action cannot be undone.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">Content Information</Typography>
                    <Typography><strong>Title:</strong> {selectedVideo.title || 'Untitled'}</Typography>
                    <Typography><strong>Creator:</strong> {selectedVideo.creator?.username}</Typography>
                    <Typography><strong>Duration:</strong> {selectedVideo.duration}</Typography>
                    <Typography><strong>Status:</strong> {selectedVideo.status}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Statistics</Typography>
                    <Typography><strong>Views:</strong> {(selectedVideo.viewCount || 0).toLocaleString()}</Typography>
                    <Typography><strong>Likes:</strong> {(selectedVideo.likeCount || 0).toLocaleString()}</Typography>
                    <Typography><strong>Comments:</strong> {(selectedVideo.commentCount || 0).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Description</Typography>
                    <Typography>{selectedVideo.description || 'No description available'}</Typography>
                  </Grid>
                  {selectedVideo.hashtags && (
                    <Grid item xs={12}>
                      <Typography variant="h6">Hashtags</Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedVideo.hashtags.map((tag, index) => (
                          <Chip key={index} label={`#${tag}`} size="small" />
                        ))}
                      </Box>
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
                  onClick={handleDeleteVideo}
                  color="error"
                  variant="contained"
                >
                  Delete {videoType}
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

export default VideoManagement;