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
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Flag as FlagIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const CommunityManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { getCommunityPosts, moderatePost } = useApi();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getCommunityPosts();
      if (response.success && response.data) {
        setPosts(response.data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (postId, action) => {
    try {
      await moderatePost(postId, action);
      fetchPosts();
    } catch (error) {
      console.error('Failed to moderate post:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Community Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ForumIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Posts
                  </Typography>
                  <Typography variant="h6">
                    {posts.length}
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
                    Reported Posts
                  </Typography>
                  <Typography variant="h6">
                    {posts.filter(p => p.reports > 0).length}
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
              <TableCell>Post</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Engagement</TableCell>
              <TableCell>Reports</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {post.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {post.content.substring(0, 50)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 1, width: 30, height: 30 }}>
                      {post.author.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {post.author.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {post.likes} likes • {post.comments} comments
                  </Typography>
                </TableCell>
                <TableCell>
                  {post.reports > 0 ? (
                    <Chip label={`${post.reports} reports`} color="warning" size="small" />
                  ) : (
                    <Typography variant="body2" color="textSecondary">None</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={post.isHidden ? 'Hidden' : 'Visible'}
                    color={post.isHidden ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => { setSelectedPost(post); setOpenDialog(true); }}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    color="error"
                    onClick={() => handleModerate(post._id, 'delete')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedPost && (
          <>
            <DialogTitle>Post Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedPost.title}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    By {selectedPost.author.name} on {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    {selectedPost.content}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Engagement:</strong> {selectedPost.likes} likes, {selectedPost.comments} comments
                  </Typography>
                  <Typography variant="body2">
                    <strong>Reports:</strong> {selectedPost.reports}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button 
                variant="contained" 
                color="warning"
                onClick={() => {
                  handleModerate(selectedPost._id, selectedPost.isHidden ? 'show' : 'hide');
                  setOpenDialog(false);
                }}
              >
                {selectedPost.isHidden ? 'Show' : 'Hide'} Post
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => {
                  handleModerate(selectedPost._id, 'delete');
                  setOpenDialog(false);
                }}
              >
                Delete Post
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CommunityManagement;