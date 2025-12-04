import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const ContentModeration = () => {
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all');

  const { getContentModerationQueue, moderateContent } = useApi();

  useEffect(() => {
    fetchModerationQueue();
  }, []);

  const fetchModerationQueue = async () => {
    try {
      setLoading(true);
      const response = await getContentModerationQueue();
      setModerationQueue(response.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch moderation queue:', error);
      showSnackbar('Failed to fetch moderation queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleModerate = async () => {
    try {
      await moderateContent(selectedContent._id, {
        action: actionType,
        reason: moderationReason
      });
      showSnackbar(`Content ${actionType}d successfully`);
      setOpenDialog(false);
      setSelectedContent(null);
      setModerationReason('');
      fetchModerationQueue();
    } catch (error) {
      console.error('Moderation failed:', error);
      showSnackbar('Failed to moderate content', 'error');
    }
  };

  const openModerationDialog = (content, action) => {
    setSelectedContent(content);
    setActionType(action);
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'flagged': return 'error';
      default: return 'default';
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'post': return <FlagIcon />;
      case 'video': return <ViewIcon />;
      case 'course': return <ViewIcon />;
      default: return <WarningIcon />;
    }
  };

  const filteredContent = moderationQueue.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Content Moderation
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="all">All Content</MenuItem>
            <MenuItem value="pending">Pending Review</MenuItem>
            <MenuItem value="flagged">Flagged Content</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Review
                  </Typography>
                  <Typography variant="h6">
                    {moderationQueue.filter(item => item.status === 'pending').length}
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
                <FlagIcon color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Flagged Content
                  </Typography>
                  <Typography variant="h6">
                    {moderationQueue.filter(item => item.status === 'flagged').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Moderation Queue Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Content</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reports</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContent.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getContentTypeIcon(item.type)}
                    <Box ml={2}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.title || 'Untitled'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.description?.substring(0, 100) || 'No description'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={item.type} size="small" />
                </TableCell>
                <TableCell>{item.author?.username || 'Unknown'}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{item.reportCount || 0}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => openModerationDialog(item, 'view')}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {item.status === 'pending' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => openModerationDialog(item, 'approve')}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => openModerationDialog(item, 'reject')}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => openModerationDialog(item, 'delete')}
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

      {/* Moderation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedContent && (
          <>
            <DialogTitle>
              {actionType === 'view' ? 'Content Details' : `${actionType} Content`}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Content Information</Typography>
                  <Typography><strong>Title:</strong> {selectedContent.title || 'Untitled'}</Typography>
                  <Typography><strong>Type:</strong> {selectedContent.type}</Typography>
                  <Typography><strong>Author:</strong> {selectedContent.author?.username}</Typography>
                  <Typography><strong>Status:</strong> {selectedContent.status}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Description</Typography>
                  <Typography>{selectedContent.description || 'No description available'}</Typography>
                </Grid>
                {actionType !== 'view' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Moderation Reason"
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              {actionType !== 'view' && (
                <Button 
                  onClick={handleModerate}
                  variant="contained"
                  color={actionType === 'approve' ? 'success' : 'error'}
                  disabled={!moderationReason && actionType !== 'approve'}
                >
                  {actionType}
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

export default ContentModeration;