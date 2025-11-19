const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`Error: ${err.message}`.red);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      code: 'RESOURCE_NOT_FOUND'
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let field = Object.keys(err.keyValue)[0];
    let value = err.keyValue[field];
    
    // Common field mappings for better error messages
    const fieldMappings = {
      email: 'Email address',
      username: 'Username',
      phone: 'Phone number'
    };
    
    const friendlyField = fieldMappings[field] || field;
    const message = `${friendlyField} '${value}' is already in use`;
    
    error = {
      message,
      statusCode: 409,
      code: 'DUPLICATE_RESOURCE',
      field
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    
    error = {
      message: 'Validation failed',
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      details: errors
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = {
      message,
      statusCode: 413,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      statusCode: 400,
      code: 'INVALID_FILE_FIELD'
    };
  }

  // Rate limiting error
  if (err.message && err.message.includes('Too many requests')) {
    error = {
      message: err.message,
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // CORS error
  if (err.message && err.message.includes('Not allowed by CORS')) {
    error = {
      message: 'Origin not allowed by CORS policy',
      statusCode: 403,
      code: 'CORS_ERROR'
    };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      code,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        originalError: err.name
      })
    }
  };

  // Add additional details if available
  if (error.details) {
    errorResponse.error.details = error.details;
  }

  if (error.field) {
    errorResponse.error.field = error.field;
  }

  // Log error for monitoring
  if (statusCode >= 500) {
    console.error('Server Error:', {
      message: error.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;