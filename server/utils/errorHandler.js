/**
 * Custom error handler for API requests
 * @param {Error} err - The error object
 * @param {Object} res - Express response object
 */
const handleError = (err, res) => {
  console.error('Error:', err);
  
  // Check if it's an API error with response data
  if (err.response && err.response.data) {
    return res.status(err.response.status || 500).json({
      error: err.response.data.message || 'Error from external API',
      details: err.response.data
    });
  }
  
  // Default error response
  return res.status(500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = { handleError }; 