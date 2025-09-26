const BaseController = require('./BaseController');

/**
 * TransactionController handles all transaction-related operations
 */
class TransactionController extends BaseController {
  constructor(repository) {
    super(repository);
  }

  /**
   * Get all transactions with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllTransactions = this.asyncHandler(async (req, res) => {
    try {
      const pagination = this.parsePagination(req.query);
      let fromDate = null;
      let toDate = null;

      try {
        const dateRange = this.parseDateRange(req.query);
        fromDate = dateRange.fromDate;
        toDate = dateRange.toDate;
      } catch (error) {
        return this.sendValidationError(res, error.message);
      }

      // Get all transactions (repository doesn't support pagination yet, but we can add it)
      const allTransactions = await this.repository.getTransactionsAsync();

      // Apply date filtering if provided
      let filteredTransactions = allTransactions;
      if (fromDate || toDate) {
        filteredTransactions = allTransactions.filter(transaction => {
          const trxDate = new Date(transaction.trxDate);
          if (fromDate && trxDate < fromDate) return false;
          if (toDate && trxDate > toDate) return false;
          return true;
        });
      }

      // Apply pagination
      const startIndex = pagination.offset;
      const endIndex = startIndex + pagination.limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

      const response = {
        transactions: paginatedTransactions,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: filteredTransactions.length,
          pages: Math.ceil(filteredTransactions.length / pagination.limit)
        },
        filters: {
          fromDate,
          toDate
        }
      };

      this.sendSuccess(res, response, 'Transactions retrieved successfully');
    } catch (error) {
      console.error('Error in getAllTransactions:', error);
      this.sendError(res, 'Failed to retrieve transactions', error);
    }
  });

  /**
   * Import transactions from CSV or JSON data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  importTransactions = this.asyncHandler(async (req, res) => {
    try {
      const { transactions } = req.body;

      if (!Array.isArray(transactions)) {
        return this.sendValidationError(res, 'Transactions must be an array');
      }

      if (transactions.length === 0) {
        return this.sendValidationError(res, 'No transactions provided for import');
      }

      // Validate transaction structure
      const requiredFields = ['cardId', 'trxDate', 'trxAmount'];
      const validationErrors = [];

      transactions.forEach((transaction, index) => {
        const missingFields = this.validateRequiredFields(transaction, requiredFields);
        if (missingFields.length > 0) {
          validationErrors.push(`Transaction ${index + 1}: Missing fields ${missingFields.join(', ')}`);
        }

        // Validate date format
        if (transaction.trxDate && isNaN(new Date(transaction.trxDate).getTime())) {
          validationErrors.push(`Transaction ${index + 1}: Invalid date format`);
        }

        // Validate amount
        if (transaction.trxAmount && (isNaN(transaction.trxAmount) || transaction.trxAmount < 0)) {
          validationErrors.push(`Transaction ${index + 1}: Invalid amount`);
        }
      });

      if (validationErrors.length > 0) {
        return this.sendValidationError(res, 'Transaction validation failed', validationErrors);
      }

      const importResult = await this.repository.importTransactionsAsync(transactions);

      this.sendSuccess(res, importResult, 'Transactions imported successfully', 201);
    } catch (error) {
      console.error('Error in importTransactions:', error);
      this.sendError(res, 'Failed to import transactions', error);
    }
  });

  /**
   * Get transaction statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransactionStats = this.asyncHandler(async (req, res) => {
    try {
      let fromDate = null;
      let toDate = null;

      try {
        const dateRange = this.parseDateRange(req.query);
        fromDate = dateRange.fromDate;
        toDate = dateRange.toDate;
      } catch (error) {
        return this.sendValidationError(res, error.message);
      }

      const allTransactions = await this.repository.getTransactionsAsync();

      // Apply date filtering if provided
      let filteredTransactions = allTransactions;
      if (fromDate || toDate) {
        filteredTransactions = allTransactions.filter(transaction => {
          const trxDate = new Date(transaction.trxDate);
          if (fromDate && trxDate < fromDate) return false;
          if (toDate && trxDate > toDate) return false;
          return true;
        });
      }

      // Calculate statistics
      const stats = {
        totalTransactions: filteredTransactions.length,
        totalAmount: filteredTransactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0),
        averageAmount: filteredTransactions.length > 0
          ? filteredTransactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0) / filteredTransactions.length
          : 0,
        uniqueCards: [...new Set(filteredTransactions.map(tx => tx.cardId))].length,
        transactionsByType: {
          purchases: filteredTransactions.filter(tx => tx.isPurchase).length,
          cash: filteredTransactions.filter(tx => tx.isCash).length,
          cardPresent: filteredTransactions.filter(tx => tx.isCardPresent).length
        },
        transactionsByCountry: this.groupByField(filteredTransactions, 'trxCountry'),
        transactionsByMccGroup: this.groupByField(filteredTransactions, 'mccGroup'),
        dateRange: {
          from: fromDate,
          to: toDate
        }
      };

      this.sendSuccess(res, stats, 'Transaction statistics retrieved successfully');
    } catch (error) {
      console.error('Error in getTransactionStats:', error);
      this.sendError(res, 'Failed to retrieve transaction statistics', error);
    }
  });

  /**
   * Get transactions by card ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransactionsByCard = this.asyncHandler(async (req, res) => {
    try {
      const { cardId } = req.params;
      const pagination = this.parsePagination(req.query);

      if (!cardId) {
        return this.sendValidationError(res, 'Card ID is required');
      }

      const allTransactions = await this.repository.getTransactionsAsync();
      const cardTransactions = allTransactions.filter(tx => tx.cardId === cardId);

      if (cardTransactions.length === 0) {
        return this.sendNotFound(res, `No transactions found for card ID: ${cardId}`);
      }

      // Apply pagination
      const startIndex = pagination.offset;
      const endIndex = startIndex + pagination.limit;
      const paginatedTransactions = cardTransactions.slice(startIndex, endIndex);

      const response = {
        cardId,
        transactions: paginatedTransactions,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: cardTransactions.length,
          pages: Math.ceil(cardTransactions.length / pagination.limit)
        },
        summary: {
          totalAmount: cardTransactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0),
          averageAmount: cardTransactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0) / cardTransactions.length
        }
      };

      this.sendSuccess(res, response, 'Card transactions retrieved successfully');
    } catch (error) {
      console.error('Error in getTransactionsByCard:', error);
      this.sendError(res, 'Failed to retrieve card transactions', error);
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
   * Get transaction by ID (placeholder for future implementation)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransactionById = this.asyncHandler(async (req, res) => {
    // TODO: Implement get transaction by ID functionality
    this.sendError(res, 'Get transaction by ID functionality not yet implemented', null, 501);
  });

  /**
   * Update transaction (placeholder for future implementation)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateTransaction = this.asyncHandler(async (req, res) => {
    // TODO: Implement transaction update functionality
    this.sendError(res, 'Transaction update functionality not yet implemented', null, 501);
  });

  /**
   * Delete transaction (placeholder for future implementation)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteTransaction = this.asyncHandler(async (req, res) => {
    // TODO: Implement transaction deletion functionality
    this.sendError(res, 'Transaction deletion functionality not yet implemented', null, 501);
  });
}

module.exports = TransactionController;