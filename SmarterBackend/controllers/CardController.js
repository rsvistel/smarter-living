const BaseController = require('./BaseController');

/**
 * CardController handles all card-related operations
 */
class CardController extends BaseController {
  constructor(repository) {
    super(repository);
  }

  /**
   * Get all cards for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserCards = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return this.sendValidationError(res, 'Invalid user ID format');
      }

      const cards = await this.repository.getUserCardsAsync(userId);

      if (!cards || cards.length === 0) {
        return this.sendNotFound(res, `No cards found for user ID: ${userId}`);
      }

      this.sendSuccess(res, {
        userId,
        cards,
        count: cards.length
      }, 'User cards retrieved successfully');
    } catch (error) {
      console.error('Error in getUserCards:', error);
      this.sendError(res, 'Failed to retrieve user cards', error);
    }
  });

  /**
   * Get a specific card for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserCard = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { cardId } = req.params;

      if (isNaN(userId)) {
        return this.sendValidationError(res, 'Invalid user ID format');
      }

      if (!cardId) {
        return this.sendValidationError(res, 'Card ID is required');
      }

      const card = await this.repository.getUserCardAsync(userId, cardId);

      if (!card) {
        return this.sendNotFound(res, `Card ${cardId} not found for user ID: ${userId}`);
      }

      this.sendSuccess(res, card, 'User card retrieved successfully');
    } catch (error) {
      console.error('Error in getUserCard:', error);
      this.sendError(res, 'Failed to retrieve user card', error);
    }
  });

  /**
   * Add a card to a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  addCardToUser = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { cardId, cardName } = req.body;

      if (isNaN(userId)) {
        return this.sendValidationError(res, 'Invalid user ID format');
      }

      const missingFields = this.validateRequiredFields(req.body, ['cardId', 'cardName']);
      if (missingFields.length > 0) {
        return this.sendValidationError(res, 'Missing required fields', missingFields);
      }

      // Check if user exists first
      const user = await this.repository.getUserByIdAsync(userId);
      if (!user) {
        return this.sendNotFound(res, `User with ID ${userId} not found`);
      }

      // Check if card already exists for this user
      const existingCard = await this.repository.getUserCardAsync(userId, cardId);
      if (existingCard) {
        return this.sendValidationError(res, `Card ${cardId} already exists for user ${userId}`);
      }

      const card = await this.repository.addCardToUserAsync(userId, cardId, cardName);

      this.sendSuccess(res, card, 'Card added to user successfully', 201);
    } catch (error) {
      console.error('Error in addCardToUser:', error);

      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return this.sendValidationError(res, 'Card ID already exists');
      }

      this.sendError(res, 'Failed to add card to user', error);
    }
  });

  /**
   * Remove a card from a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  removeCardFromUser = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { cardId } = req.params;

      if (isNaN(userId)) {
        return this.sendValidationError(res, 'Invalid user ID format');
      }

      if (!cardId) {
        return this.sendValidationError(res, 'Card ID is required');
      }

      // Check if card exists for this user first
      const existingCard = await this.repository.getUserCardAsync(userId, cardId);
      if (!existingCard) {
        return this.sendNotFound(res, `Card ${cardId} not found for user ID: ${userId}`);
      }

      const success = await this.repository.removeCardFromUserAsync(userId, cardId);

      if (success) {
        this.sendSuccess(res, {
          userId,
          cardId,
          removed: true
        }, 'Card removed from user successfully');
      } else {
        this.sendError(res, 'Failed to remove card from user');
      }
    } catch (error) {
      console.error('Error in removeCardFromUser:', error);
      this.sendError(res, 'Failed to remove card from user', error);
    }
  });

  /**
   * Get card statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCardStats = this.asyncHandler(async (req, res) => {
    try {
      const { cardId } = req.params;

      if (!cardId) {
        return this.sendValidationError(res, 'Card ID is required');
      }

      // Get all transactions for this card
      const allTransactions = await this.repository.getTransactionsAsync();
      const cardTransactions = allTransactions.filter(tx => tx.cardId === cardId);

      if (cardTransactions.length === 0) {
        return this.sendNotFound(res, `No transactions found for card ID: ${cardId}`);
      }

      // Calculate statistics
      const stats = {
        cardId,
        totalTransactions: cardTransactions.length,
        totalAmount: cardTransactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0),
        averageAmount: cardTransactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0) / cardTransactions.length,
        transactionsByType: {
          purchases: cardTransactions.filter(tx => tx.isPurchase).length,
          cash: cardTransactions.filter(tx => tx.isCash).length,
          cardPresent: cardTransactions.filter(tx => tx.isCardPresent).length
        },
        transactionsByCountry: this.groupByField(cardTransactions, 'trxCountry'),
        transactionsByMccGroup: this.groupByField(cardTransactions, 'mccGroup'),
        dateRange: {
          earliest: new Date(Math.min(...cardTransactions.map(tx => new Date(tx.trxDate)))),
          latest: new Date(Math.max(...cardTransactions.map(tx => new Date(tx.trxDate))))
        }
      };

      this.sendSuccess(res, stats, 'Card statistics retrieved successfully');
    } catch (error) {
      console.error('Error in getCardStats:', error);
      this.sendError(res, 'Failed to retrieve card statistics', error);
    }
  });

  /**
   * Helper method to group transactions by a field
   * @param {Array} transactions - Array of transactions
   * @param {string} field - Field to group by
   * @returns {Object} Grouped results
   */
  groupByField(transactions, field) {
    const groups = {};

    transactions.forEach(tx => {
      const key = tx[field] || 'Unknown';
      if (!groups[key]) {
        groups[key] = {
          count: 0,
          totalAmount: 0
        };
      }
      groups[key].count++;
      groups[key].totalAmount += parseFloat(tx.trxAmount || 0);
    });

    return groups;
  }

  /**
   * Toggle card active status (placeholder for future implementation)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  toggleCardStatus = this.asyncHandler(async (req, res) => {
    // TODO: Implement card status toggle functionality
    this.sendError(res, 'Card status toggle functionality not yet implemented', null, 501);
  });
}

module.exports = CardController;