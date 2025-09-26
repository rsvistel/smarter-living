/**
 * Base Controller class providing common functionality for all controllers
 */
class BaseController {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Standard success response
   * @param {Object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  sendSuccess(res, data, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Standard error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  sendError(res, message, error = null, statusCode = 500) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error = error.message;
      response.stack = error.stack;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Validation error response
   * @param {Object} res - Express response object
   * @param {string} message - Validation error message
   * @param {Array} errors - Array of validation errors
   */
  sendValidationError(res, message, errors = []) {
    res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Not found response
   * @param {Object} res - Express response object
   * @param {string} message - Not found message
   */
  sendNotFound(res, message = 'Resource not found') {
    res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Wrapper for async controller methods to handle errors
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Express middleware function
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Parse pagination parameters from query
   * @param {Object} query - Express query object
   * @returns {Object} Pagination parameters
   */
  parsePagination(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset,
      skip: offset
    };
  }

  /**
   * Parse date range from query
   * @param {Object} query - Express query object
   * @returns {Object} Date range parameters
   */
  parseDateRange(query) {
    let fromDate = null;
    let toDate = null;

    if (query.fromDate) {
      fromDate = new Date(query.fromDate);
      if (isNaN(fromDate.getTime())) {
        throw new Error('Invalid fromDate format');
      }
    }

    if (query.toDate) {
      toDate = new Date(query.toDate);
      if (isNaN(toDate.getTime())) {
        throw new Error('Invalid toDate format');
      }
    }

    return { fromDate, toDate };
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @param {Array} requiredFields - Array of required field names
   * @returns {Array} Array of missing fields
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        missingFields.push(field);
      }
    }

    return missingFields;
  }
}

module.exports = BaseController;