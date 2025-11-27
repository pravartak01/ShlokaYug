/**
 * Notes Controller
 * Handles student notes for lectures
 */

const Note = require('../models/Note');
const Enrollment = require('../models/Enrollment');

/**
 * Get notes for a specific lecture
 */
exports.getNotes = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user.id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    const notes = await Note.find({ userId, courseId, lectureId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { notes },
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notes',
      error: error.message,
    });
  }
};

/**
 * Create a new note
 */
exports.createNote = async (req, res) => {
  try {
    const { courseId, lectureId, content } = req.body;
    const userId = req.user.id;

    // Verify enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    const note = new Note({
      userId,
      courseId,
      lectureId,
      content,
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note },
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error.message,
    });
  }
};

/**
 * Update a note
 */
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    note.content = content;
    note.updatedAt = new Date();
    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note },
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error.message,
    });
  }
};

/**
 * Delete a note
 */
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message,
    });
  }
};
