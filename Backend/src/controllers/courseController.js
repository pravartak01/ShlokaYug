const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

/**
 * Course Management Controller
 * Handles all course-related API operations including CRUD, publishing, and instructor management
 */

// ============================================================================
// COURSE CRUD OPERATIONS
// ============================================================================

/**
 * Create a new course
 * POST /api/courses
 * Access: Private (Gurus only)
 */
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if user is a verified guru
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'guru') {
      return res.status(403).json({
        success: false,
        message: 'Only gurus can create courses'
      });
    }
    
    // TODO: Re-enable in production
    // if (!user.guruProfile.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Only verified gurus can create courses'
    //   });
    // }

    const {
      title,
      description,
      shortDescription,
      category,
      subCategory,
      level,
      language,
      duration,
      pricing,
      tags,
      learningObjectives,
      prerequisites,
      targetAudience
    } = req.body;

    const courseData = {
      title: title.trim(),
      description: description.trim(),
      shortDescription: shortDescription?.trim(),
      category,
      subCategory,
      level,
      language,
      duration,
      instructor: {
        userId: req.user.id,
        name: user.profile.firstName + ' ' + user.profile.lastName,
        bio: user.guruProfile?.bio || '',
        credentials: Array.isArray(user.guruProfile?.credentials) 
          ? user.guruProfile.credentials.join(', ') 
          : (user.guruProfile?.credentials || 'Certified Instructor')
      },
      // Map to metadata structure
      metadata: {
        category: [category], // Convert to array
        difficulty: level, // Map level to difficulty
        tags: tags || [],
        language: {
          instruction: language, // Use same language for instruction
          content: language === 'mixed' ? 'mixed' : 'sanskrit' // Default content to sanskrit
        }
      },
      pricing,
      tags: tags?.map(tag => tag.trim()),
      learningObjectives: learningObjectives?.map(obj => obj.trim()),
      prerequisites: prerequisites?.map(prereq => prereq.trim()),
      targetAudience,
      status: 'draft', // Always start as draft
      availability: {
        isActive: false, // Not active until published
        enrollmentStartDate: new Date(),
        enrollmentEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      settings: {
        allowComments: true,
        allowRatings: true,
        autoEnrollment: false,
        maxEnrollments: pricing.type === 'free' ? 10000 : 1000,
        accessDuration: pricing.type === 'subscription' ? 30 : 365, // days
        downloadableContent: false,
        certificateEnabled: true
      },
      seo: {
        metaTitle: title,
        metaDescription: shortDescription || description.substring(0, 160)
      }
    };

    const course = new Course(courseData);
    await course.save();

    // Update guru's course count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'guruProfile.courseCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course: {
          id: course._id,
          title: course.title,
          status: course.status,
          createdAt: course.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get all courses (with filtering, pagination, and search)
 * GET /api/courses
 * Access: Public
 */
const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      subCategory,
      level,
      language,
      pricing,
      status,
      instructor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      minRating,
      minDuration,
      maxDuration
    } = req.query;

    // Build filter query
    const filter = {};

    // Only show published courses for public access - NO CHECKS FOR DEVELOPMENT
    // Allow all courses to be visible regardless of status
    // if (!req.user || req.user.role !== 'admin') {
    //   filter['publishing.status'] = 'published';
    //   filter['metadata.isActive'] = true;
    // } else if (status) {
    //   filter['publishing.status'] = status;
    // }

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Category filters
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (level) filter.level = level;
    if (language) filter.language = language;
    if (instructor) filter['instructor.userId'] = instructor;

    // Pricing filter
    if (pricing) {
      if (pricing === 'free') {
        filter['pricing.type'] = 'free';
      } else if (pricing === 'paid') {
        filter['pricing.type'] = { $in: ['one_time', 'subscription'] };
      } else {
        filter['pricing.type'] = pricing;
      }
    }

    // Featured filter
    if (featured === 'true') {
      filter.featured = true;
    }

    // Rating filter
    if (minRating) {
      filter['analytics.ratings.average'] = { $gte: parseFloat(minRating) };
    }

    // Duration filter (in hours)
    if (minDuration || maxDuration) {
      filter['duration.hours'] = {};
      if (minDuration) filter['duration.hours'].$gte = parseInt(minDuration);
      if (maxDuration) filter['duration.hours'].$lte = parseInt(maxDuration);
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'title', 'pricing.amount', 'analytics.ratings.average', 'analytics.enrollmentCount'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .select('title shortDescription category subCategory level language duration pricing thumbnail analytics instructor featured status createdAt updatedAt')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses: total,
          coursesPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search,
          category,
          subCategory,
          level,
          language,
          pricing,
          status
        }
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get single course by ID
 * GET /api/courses/:id
 * Access: Public (published) / Private (drafts - instructor only)
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeContent = 'false' } = req.query;

    // Find course
    let selectFields = '-__v';
    if (includeContent === 'false') {
      selectFields += ' -structure.units.lessons.lectures.content -structure.units.lessons.lectures.resources';
    }

    const course = await Course.findById(id).select(selectFields);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Convert to plain object for response
    const courseObj = course.toObject();

    // NO PERMISSION CHECKS - ALLOW ALL ACCESS FOR DEVELOPMENT

    // If user is authenticated, get their enrollment and progress
    let userEnrollment = null;
    let userProgress = null;

    if (req.user) {
      try {
        userEnrollment = await Enrollment.findOne({
          userId: req.user.id,  // Changed from studentId to userId
          courseId: id
        }).select('enrollmentType access progress createdAt');

        if (userEnrollment && userEnrollment.progress) {
          userProgress = {
            completionPercentage: userEnrollment.progress.completionPercentage || 0,
            lecturesCompleted: userEnrollment.progress.lecturesCompleted?.length || 0,
            totalTimeSpent: userEnrollment.progress.totalWatchTime || 0,
            lastAccessedAt: userEnrollment.access?.lastAccessedAt,
            isCompleted: userEnrollment.progress.isCompleted || false
          };
        }
      } catch (err) {
        // Ignore enrollment errors
        console.log('Enrollment fetch error (non-critical):', err.message);
      }
    }

    // Prepare response data
    const responseData = {
      course: courseObj,
      userAccess: {
        isEnrolled: !!userEnrollment,
        enrollmentStatus: userEnrollment?.access?.status,
        enrollmentType: userEnrollment?.enrollmentType,
        progress: userProgress
      }
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Update course
 * PUT /api/courses/:id
 * Access: Private (Instructor only)
 */
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    const isInstructor = course.instructor.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent updates to published courses (except admin)
    if (course.status === 'published' && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update published course. Create a new version instead.'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'shortDescription', 'category', 'subCategory',
      'level', 'language', 'duration', 'pricing', 'tags', 'learningObjectives',
      'prerequisites', 'targetAudience', 'thumbnail', 'settings', 'seo'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update timestamps
    updates.updatedAt = new Date();

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('title status updatedAt');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse
      }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Delete course
 * DELETE /api/courses/:id
 * Access: Private (Instructor only - soft delete)
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    const isInstructor = course.instructor.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if course has active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      courseId: id,
      status: 'active'
    });

    if (activeEnrollments > 0 && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments'
      });
    }

    // Soft delete - update status instead of removing
    await Course.findByIdAndUpdate(id, {
      status: 'deleted',
      'availability.isActive': false,
      deletedAt: new Date()
    });

    // Update guru's course count
    await User.findByIdAndUpdate(course.instructor.userId, {
      $inc: { 'guruProfile.courseCount': -1 }
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ============================================================================
// COURSE CONTENT MANAGEMENT
// ============================================================================

/**
 * Add unit to course
 * POST /api/courses/:id/units
 * Access: Private (Instructor only)
 */
const addUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // NO AUTH CHECK - ALLOW ALL ACCESS FOR DEVELOPMENT

    // Initialize structure if not exists
    if (!course.structure) {
      course.structure = { units: [] };
    }
    if (!course.structure.units) {
      course.structure.units = [];
    }

    // Create new unit with required unitId
    const newUnit = {
      unitId: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description?.trim(),
      order: order || course.structure.units.length + 1,
      estimatedDuration: 0,
      lessons: []
    };

    course.structure.units.push(newUnit);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Unit added successfully',
      data: {
        unit: course.structure.units[course.structure.units.length - 1]
      }
    });

  } catch (error) {
    console.error('Add unit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add unit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Add lesson to unit
 * POST /api/courses/:courseId/units/:unitId/lessons
 * Access: Private (Instructor only)
 */
const addLesson = async (req, res) => {
  try {
    const { courseId, unitId } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // NO AUTH CHECK - ALLOW ALL ACCESS FOR DEVELOPMENT

    const unit = course.structure.units.id(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Create new lesson with required lessonId
    const newLesson = {
      lessonId: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description?.trim(),
      order: order || unit.lessons.length + 1,
      estimatedDuration: 0,
      lectures: []
    };

    unit.lessons.push(newLesson);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: {
        lesson: unit.lessons[unit.lessons.length - 1]
      }
    });

  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Add lecture to lesson
 * POST /api/courses/:courseId/units/:unitId/lessons/:lessonId/lectures
 * Access: Private (Instructor only)
 */
const addLecture = async (req, res) => {
  try {
    const { courseId, unitId, lessonId } = req.params;
    const { title, description, type, duration, order, content, resources } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // NO AUTH CHECK - ALLOW ALL ACCESS FOR DEVELOPMENT

    const unit = course.structure.units.id(unitId);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    const lesson = unit.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Create new lecture with required lectureId
    const newLecture = {
      lectureId: `lecture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description?.trim(),
      type: type || 'video',
      order: order || lesson.lectures.length + 1,
      content: content || {},
      resources: resources || []
    };

    lesson.lectures.push(newLecture);

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lecture added successfully',
      data: {
        lecture: lesson.lectures[lesson.lectures.length - 1]
      }
    });

  } catch (error) {
    console.error('Add lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add lecture',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ============================================================================
// COURSE PUBLISHING & STATUS MANAGEMENT
// ============================================================================

/**
 * Publish course
 * PATCH /api/courses/:id/publish
 * Access: Private (Instructor only)
 */
const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check instructor access
    if (course.instructor.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate course completeness before publishing
    const validationErrors = [];

    if (!course.title || course.title.trim() === '') {
      validationErrors.push('Title is required');
    }
    if (!course.description || course.description.trim() === '') {
      validationErrors.push('Description is required');
    }
    // Thumbnail is optional for now
    // if (!course.thumbnail) {
    //   validationErrors.push('Thumbnail image is required');
    // }
    
    // Check if course has structure with units
    if (!course.structure || !course.structure.units || course.structure.units.length === 0) {
      validationErrors.push('At least one unit is required');
    } else {
      const hasLectures = course.structure.units.some(unit => 
        unit.lessons && unit.lessons.some(lesson => lesson.lectures && lesson.lectures.length > 0)
      );
      if (!hasLectures) {
        validationErrors.push('At least one lecture is required');
      }
    }
    if (!course.pricing || !course.pricing.type || (course.pricing.type !== 'free' && (!course.pricing.amount || course.pricing.amount <= 0))) {
      validationErrors.push('Valid pricing information is required');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Course is not ready for publishing',
        errors: validationErrors
      });
    }

    // Update course status
    course.publishing = course.publishing || {};
    course.publishing.status = 'published';
    course.availability = course.availability || {};
    course.availability.isActive = true;
    course.publishing.publishedAt = new Date();
    
    await course.save();

    res.json({
      success: true,
      message: 'Course published successfully',
      data: {
        course: {
          id: course._id,
          title: course.title,
          status: course.status,
          publishedAt: course.publishedAt
        }
      }
    });

  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Unpublish course
 * PATCH /api/courses/:id/unpublish
 * Access: Private (Instructor only)
 */
const unpublishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check instructor access
    if (course.instructor.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check for active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      courseId: id,
      status: 'active'
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unpublish course with active enrollments'
      });
    }

    // Update course status
    course.status = 'draft';
    course.availability.isActive = false;
    
    await course.save();

    res.json({
      success: true,
      message: 'Course unpublished successfully',
      data: {
        course: {
          id: course._id,
          title: course.title,
          status: course.status
        }
      }
    });

  } catch (error) {
    console.error('Unpublish course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ============================================================================
// INSTRUCTOR DASHBOARD & ANALYTICS
// ============================================================================

/**
 * Get instructor's courses
 * GET /api/instructor/courses
 * Access: Private (Gurus only)
 */
const getInstructorCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'updatedAt',
      sortOrder = 'desc' 
    } = req.query;

    // Check if user is a guru
    if (req.user.role !== 'guru') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build filter
    const filter = {
      'instructor.userId': req.user.id,
      status: { $ne: 'deleted' }
    };

    if (status) {
      filter.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .select('title status analytics createdAt updatedAt publishedAt thumbnail pricing units')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(filter)
    ]);

    // Enhance courses with computed data
    const enhancedCourses = courses.map(course => {
      const totalUnits = course.units?.length || 0;
      const totalLessons = course.units?.reduce((acc, unit) => acc + (unit.lessons?.length || 0), 0) || 0;
      const totalLectures = course.units?.reduce((acc, unit) => 
        acc + (unit.lessons?.reduce((lessonAcc, lesson) => 
          lessonAcc + (lesson.lectures?.length || 0), 0) || 0), 0) || 0;

      return {
        ...course,
        contentStats: {
          totalUnits,
          totalLessons,
          totalLectures
        }
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        courses: enhancedCourses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses: total,
          coursesPerPage: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get course analytics for instructor
 * GET /api/instructor/courses/:id/analytics
 * Access: Private (Course instructor only)
 */
const getCourseAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check instructor access
    if (course.instructor.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get enrollment data
    const enrollmentData = await Enrollment.aggregate([
      {
        $match: {
          courseId: course._id,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          enrollments: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$payment.status', 'completed'] },
                '$payment.amount',
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get progress data
    const progressData = await Progress.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollmentId',
          foreignField: '_id',
          as: 'enrollment'
        }
      },
      {
        $unwind: '$enrollment'
      },
      {
        $match: {
          'enrollment.courseId': course._id,
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$completionPercentage' },
          totalWatchTime: { $sum: '$totalTimeSpent' },
          completionCount: {
            $sum: {
              $cond: [{ $gte: ['$completionPercentage', 100] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get total enrollments and revenue
    const totalStats = await Enrollment.aggregate([
      {
        $match: { courseId: course._id }
      },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$payment.status', 'completed'] },
                '$payment.amount',
                0
              ]
            }
          },
          activeEnrollments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const analytics = {
      overview: {
        totalEnrollments: totalStats[0]?.totalEnrollments || 0,
        activeEnrollments: totalStats[0]?.activeEnrollments || 0,
        totalRevenue: totalStats[0]?.totalRevenue || 0,
        averageProgress: progressData[0]?.averageProgress || 0,
        completionRate: totalStats[0]?.totalEnrollments > 0 
          ? ((progressData[0]?.completionCount || 0) / totalStats[0].totalEnrollments) * 100 
          : 0,
        totalWatchTime: progressData[0]?.totalWatchTime || 0
      },
      chartData: {
        enrollments: enrollmentData,
        revenue: enrollmentData
      },
      period
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  // Course CRUD
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,

  // Content Management
  addUnit,
  addLesson,
  addLecture,

  // Publishing
  publishCourse,
  unpublishCourse,

  // Instructor Dashboard
  getInstructorCourses,
  getCourseAnalytics
};