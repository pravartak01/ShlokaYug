/**
 * Notes Routes
 * Handles student notes for lectures
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notesController = require('../controllers/notesController');

// Get notes for a lecture
router.get('/:courseId/:lectureId', auth, notesController.getNotes);

// Create a new note
router.post('/', auth, notesController.createNote);

// Update a note
router.put('/:noteId', auth, notesController.updateNote);

// Delete a note
router.delete('/:noteId', auth, notesController.deleteNote);

module.exports = router;
