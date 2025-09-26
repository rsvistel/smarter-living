const BaseController = require('./BaseController');

/**
 * UserController handles all user-related operations
 */
class UserController extends BaseController {
  constructor(repository) {
    super(repository);
  }

  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllUsers = this.asyncHandler(async (req, res) => {
    try {
      const users = await this.repository.getUserAsync();

      this.sendSuccess(res, {
        users,
        count: users.length
      }, 'Users retrieved successfully');
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      this.sendError(res, 'Failed to retrieve users', error);
    }
  });

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserById = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return this.sendValidationError(res, 'Invalid user ID format');
      }

      const user = await this.repository.getUserByIdAsync(userId);

      if (!user) {
        return this.sendNotFound(res, `User with ID ${userId} not found`);
      }

      this.sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      console.error('Error in getUserById:', error);
      this.sendError(res, 'Failed to retrieve user', error);
    }
  });

  /**
   * Create user with username and password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createUser = this.asyncHandler(async (req, res) => {
    try {
      const { username, password } = req.body;

      const missingFields = this.validateRequiredFields(req.body, ['username', 'password']);
      if (missingFields.length > 0) {
        return this.sendValidationError(res, 'Missing required fields', missingFields);
      }

      const user = await this.repository.createUserAsync(username, password);

      this.sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      console.error('Error in createUser:', error);

      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return this.sendValidationError(res, 'Username or email already exists');
      }

      this.sendError(res, 'Failed to create user', error);
    }
  });

  /**
   * Create user with user object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createUserWithObject = this.asyncHandler(async (req, res) => {
    try {
      const userData = req.body;

      const missingFields = this.validateRequiredFields(userData, ['email']);
      if (missingFields.length > 0) {
        return this.sendValidationError(res, 'Missing required fields', missingFields);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return this.sendValidationError(res, 'Invalid email format');
      }

      const user = await this.repository.createUserWithObjectAsync(userData);

      this.sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      console.error('Error in createUserWithObject:', error);

      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return this.sendValidationError(res, 'Email or username already exists');
      }

      this.sendError(res, 'Failed to create user', error);
    }
  });

  /**
   * Get user transactions grouped by cards
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserTransactionsByCards = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return this.sendValidationError(res, 'Invalid user ID format');
      }

      const includeInactive = req.query.includeInactive === 'true';

      let fromDate = null;
      let toDate = null;

      try {
        const dateRange = this.parseDateRange(req.query);
        fromDate = dateRange.fromDate;
        toDate = dateRange.toDate;
      } catch (error) {
        return this.sendValidationError(res, error.message);
      }

      const result = await this.repository.getUserTransactionsByCardsAsync(
        userId,
        includeInactive,
        fromDate,
        toDate
      );

      if (!result) {
        return this.sendNotFound(res, `No transactions found for user ID ${userId}`);
      }

      this.sendSuccess(res, result, 'User transactions retrieved successfully');
    } catch (error) {
      console.error('Error in getUserTransactionsByCards:', error);
      this.sendError(res, 'Failed to retrieve user transactions', error);
    }
  });

  /**
   * Update user (placeholder for future implementation)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateUser = this.asyncHandler(async (req, res) => {
    // TODO: Implement user update functionality
    this.sendError(res, 'User update functionality not yet implemented', null, 501);
  });

  /**
   * Delete user (placeholder for future implementation)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteUser = this.asyncHandler(async (req, res) => {
    // TODO: Implement user deletion functionality
    this.sendError(res, 'User deletion functionality not yet implemented', null, 501);
  });

  /**
   * Get user statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserStats = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return this.sendValidationError(res, 'Invalid user ID format');
      }

      const user = await this.repository.getUserByIdAsync(userId);

      if (!user) {
        return this.sendNotFound(res, `User with ID ${userId} not found`);
      }

      const cards = await this.repository.getUserCardsAsync(userId);
      const transactionData = await this.repository.getUserTransactionsByCardsAsync(userId, true);

      const stats = {
        userId: user.id,
        email: user.email,
        name: user.name,
        totalCards: cards.length,
        activeCards: cards.filter(card => card.isActive).length,
        inactiveCards: cards.filter(card => !card.isActive).length,
        totalTransactions: transactionData ? transactionData.totalTransactions : 0,
        totalAmount: transactionData ? transactionData.totalAmount : 0,
        memberSince: user.createdAt
      };

      this.sendSuccess(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      console.error('Error in getUserStats:', error);
      this.sendError(res, 'Failed to retrieve user statistics', error);
    }
  });
}

module.exports = UserController;