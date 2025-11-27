const notFound = (req, res, next) => {
  const error = {
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      suggestion: 'Please check the API documentation for valid endpoints',
    },
  };

  // Log 404 for monitoring
  console.log(`404 - ${req.method} ${req.originalUrl} - ${req.ip}`);

  res.status(404).json(error);
};

module.exports = notFound;
