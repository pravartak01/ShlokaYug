/**
 * Guru Authentication Controller
 * Handles guru application, login, and profile management
 * Separate from regular user authentication
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const Guru = require('../models/Guru');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Create and send token
const createSendToken = (guru, statusCode, res) => {
  const token = signToken(guru._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
  res.cookie('jwt', token, cookieOptions);
  
  // Remove password from output
  guru.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      guru
    },
  });
};

/**
 * @desc    Apply to become a guru (initial registration)
 * @route   POST /api/v1/guru/apply
 * @access  Public
 */
const applyAsGuru = catchAsync(async (req, res, next) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    bio,
    education,
    certifications,
    teachingExperience,
    subjects,
    specializations,
    languagesKnown
  } = req.body;
  
  // Check if guru already exists
  const existingGuru = await Guru.findOne({
    $or: [{ email }, { username }]
  });
  
  if (existingGuru) {
    return next(new AppError('Guru with this email or username already exists', 400));
  }
  
  // Create new guru application
  const newGuru = await Guru.create({
    username,
    email,
    password,
    profile: {
      firstName,
      lastName,
      phoneNumber,
      bio
    },
    credentials: {
      education: education || [],
      certifications: certifications || [],
      teachingExperience: teachingExperience || { totalYears: 0 }
    },
    expertise: {
      subjects: subjects || [],
      specializations: specializations || [],
      languagesKnown: languagesKnown || []
    },
    applicationStatus: {
      status: 'draft' // Start as draft, will be submitted later
    }
  });
  
  // Generate email verification token
  const verifyToken = newGuru.createEmailVerificationToken();
  await newGuru.save({ validateBeforeSave: false });
  
  res.status(201).json({
    status: 'success',
    message: 'Guru application created successfully. Please complete your profile and submit for review.',
    data: {
      guru: {
        id: newGuru._id,
        username: newGuru.username,
        email: newGuru.email,
        fullName: newGuru.fullName,
        applicationStatus: newGuru.applicationStatus.status
      }
    }
  });
});

/**
 * @desc    Update guru profile and submit application
 * @route   PATCH /api/v1/guru/profile/complete
 * @access  Private (Guru)
 */
const completeProfile = catchAsync(async (req, res, next) => {
  const guru = await Guru.findById(req.guru.id);
  
  if (!guru) {
    return next(new AppError('Guru not found', 404));
  }
  
  if (guru.applicationStatus.status !== 'draft') {
    return next(new AppError('Profile can only be updated when application is in draft status', 400));
  }
  
  // Update guru profile with provided data
  const allowedUpdates = [
    'profile',
    'credentials', 
    'expertise',
    'teachingPreferences',
    'social'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field]) {
      guru[field] = { ...guru[field], ...req.body[field] };
    }
  });
  
  await guru.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      guru
    }
  });
});

/**
 * @desc    Submit guru application for admin review
 * @route   POST /api/v1/guru/submit-application
 * @access  Private (Guru)
 */
const submitApplication = catchAsync(async (req, res, next) => {
  const guru = await Guru.findById(req.guru.id);
  
  if (!guru) {
    return next(new AppError('Guru not found', 404));
  }
  
  if (guru.applicationStatus.status !== 'draft') {
    return next(new AppError('Application has already been submitted', 400));
  }
  
  // Validate required fields for submission
  if (!guru.credentials.education.length) {
    return next(new AppError('At least one education credential is required', 400));
  }
  
  if (!guru.credentials.teachingExperience.totalYears && guru.credentials.teachingExperience.totalYears !== 0) {
    return next(new AppError('Teaching experience information is required', 400));
  }
  
  if (!guru.expertise.subjects.length) {
    return next(new AppError('At least one subject expertise is required', 400));
  }
  
  // Submit application
  guru.submitApplication();
  await guru.save();
  
  // TODO: Send notification to admins about new application
  
  res.status(200).json({
    status: 'success',
    message: 'Application submitted successfully. You will be notified once it is reviewed by our team.',
    data: {
      guru: {
        id: guru._id,
        applicationStatus: guru.applicationStatus,
        submittedAt: guru.applicationStatus.submittedAt
      }
    }
  });
});

/**
 * @desc    Guru login (only for approved gurus)
 * @route   POST /api/v1/guru/login
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
  const { identifier, password } = req.body;
  
  // 1) Check if identifier and password exist
  if (!identifier || !password) {
    return next(new AppError('Please provide email/username and password', 400));
  }
  
  // 2) Check if guru exists and password is correct
  const guru = await Guru.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  }).select('+password');
  
  if (!guru || !(await guru.correctPassword(password, guru.password))) {
    return next(new AppError('Incorrect email/username or password', 401));
  }
  
  // 3) Check if guru is approved
  if (!guru.accountStatus.isApproved) {
    let message = 'Your guru application is still under review. Please wait for approval.';
    
    if (guru.applicationStatus.status === 'rejected') {
      message = `Your guru application was rejected. Reason: ${guru.applicationStatus.rejectionReason}`;
    } else if (guru.applicationStatus.status === 'draft') {
      message = 'Please complete and submit your guru application first.';
    }
    
    return next(new AppError(message, 403));
  }
  
  // 4) Check if account is active
  if (!guru.accountStatus.isActive) {
    return next(new AppError('Your account has been suspended. Please contact support.', 403));
  }
  
  // 5) Update last login
  guru.metadata.lastLogin = new Date();
  await guru.save({ validateBeforeSave: false });
  
  // 6) If everything ok, send token to client
  createSendToken(guru, 200, res);
});

/**
 * @desc    Guru logout
 * @route   POST /api/v1/guru/logout
 * @access  Private
 */
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

/**
 * @desc    Get current guru profile
 * @route   GET /api/v1/guru/me
 * @access  Private (Guru)
 */
const getMe = catchAsync(async (req, res, next) => {
  const guru = await Guru.findById(req.guru.id);
  
  res.status(200).json({
    status: 'success',
    data: {
      guru
    }
  });
});

/**
 * @desc    Update guru profile
 * @route   PATCH /api/v1/guru/me
 * @access  Private (Guru)
 */
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password.',
        400
      )
    );
  }
  
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const allowedFields = [
    'profile.firstName',
    'profile.lastName', 
    'profile.phoneNumber',
    'profile.bio',
    'profile.profilePicture',
    'expertise.specializations',
    'teachingPreferences',
    'social'
  ];
  
  const guru = await Guru.findById(req.guru.id);
  
  // Update allowed fields
  allowedFields.forEach(field => {
    const fieldParts = field.split('.');
    if (fieldParts.length === 2) {
      if (req.body[fieldParts[0]] && req.body[fieldParts[0]][fieldParts[1]] !== undefined) {
        if (!guru[fieldParts[0]]) guru[fieldParts[0]] = {};
        guru[fieldParts[0]][fieldParts[1]] = req.body[fieldParts[0]][fieldParts[1]];
      }
    } else if (req.body[field] !== undefined) {
      guru[field] = req.body[field];
    }
  });
  
  await guru.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      guru
    }
  });
});

/**
 * @desc    Update guru password
 * @route   PATCH /api/v1/guru/update-password
 * @access  Private (Guru)
 */
const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get guru from collection
  const guru = await Guru.findById(req.guru.id).select('+password');
  
  // 2) Check if POSTed current password is correct
  if (!(await guru.correctPassword(req.body.passwordCurrent, guru.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  
  // 3) If so, update password
  guru.password = req.body.password;
  guru.passwordConfirm = req.body.passwordConfirm;
  await guru.save();
  
  // 4) Log guru in, send JWT
  createSendToken(guru, 200, res);
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/guru/forgot-password
 * @access  Public
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get guru based on POSTed email
  const guru = await Guru.findOne({ email: req.body.email });
  if (!guru) {
    return next(new AppError('There is no guru with that email address.', 404));
  }
  
  // 2) Generate the random reset token
  const resetToken = guru.createPasswordResetToken();
  await guru.save({ validateBeforeSave: false });
  
  // 3) Send it to guru's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/guru/reset-password/${resetToken}`;
    
    await sendEmail({
      email: guru.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`,
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    guru.security.passwordResetToken = undefined;
    guru.security.passwordResetExpires = undefined;
    await guru.save({ validateBeforeSave: false });
    
    return next(
      new AppError('There was an error sending the email. Try again later.'),
      500
    );
  }
});

/**
 * @desc    Reset password
 * @route   PATCH /api/v1/guru/reset-password/:token
 * @access  Public
 */
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get guru based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  
  const guru = await Guru.findOne({
    'security.passwordResetToken': hashedToken,
    'security.passwordResetExpires': { $gt: Date.now() },
  });
  
  // 2) If token has not expired, and there is guru, set the new password
  if (!guru) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  guru.password = req.body.password;
  guru.passwordConfirm = req.body.passwordConfirm;
  guru.security.passwordResetToken = undefined;
  guru.security.passwordResetExpires = undefined;
  await guru.save();
  
  // 3) Update changedPasswordAt property for the guru
  
  // 4) Log the guru in, send JWT
  createSendToken(guru, 200, res);
});

/**
 * @desc    Get application status
 * @route   GET /api/v1/guru/application-status
 * @access  Private (Guru)
 */
const getApplicationStatus = catchAsync(async (req, res, next) => {
  const guru = await Guru.findById(req.guru.id);
  
  res.status(200).json({
    status: 'success',
    data: {
      applicationStatus: guru.applicationStatus,
      accountStatus: guru.accountStatus,
      verification: guru.verification
    }
  });
});

module.exports = {
  applyAsGuru,
  completeProfile,
  submitApplication,
  login,
  logout,
  getMe,
  updateMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  getApplicationStatus
};