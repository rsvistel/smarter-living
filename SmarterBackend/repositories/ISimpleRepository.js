const models = require('../models');

/**
 * Interface for SimpleRepository - Node.js equivalent of C# ISimpleRepository
 * This is implemented as a base class with abstract methods to simulate interface behavior
 */
class ISimpleRepository {
  /**
   * Get all users
   * @returns {Promise<UserModel[]>}
   */
  async getUserAsync() {
    throw new Error('Method must be implemented');
  }

  /**
   * Create user with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<UserModel>}
   */
  async createUserAsync(username, password) {
    throw new Error('Method must be implemented');
  }

  /**
   * Create user with user object
   * @param {UserModel} user
   * @returns {Promise<UserModel>}
   */
  async createUserWithObjectAsync(user) {
    throw new Error('Method must be implemented');
  }

  /**
   * Import transactions
   * @param {TransactionModel[]} transactions
   * @returns {Promise<ImportResult>}
   */
  async importTransactionsAsync(transactions) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get all transactions
   * @returns {Promise<TransactionModel[]>}
   */
  async getTransactionsAsync() {
    throw new Error('Method must be implemented');
  }

  /**
   * Add card to user
   * @param {number} userId
   * @param {string} cardId
   * @param {string} cardName
   * @returns {Promise<UserCardModel>}
   */
  async addCardToUserAsync(userId, cardId, cardName) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get user cards
   * @param {number} userId
   * @returns {Promise<UserCardModel[]>}
   */
  async getUserCardsAsync(userId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get specific user card
   * @param {number} userId
   * @param {string} cardId
   * @returns {Promise<UserCardModel|null>}
   */
  async getUserCardAsync(userId, cardId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Remove card from user
   * @param {number} userId
   * @param {string} cardId
   * @returns {Promise<boolean>}
   */
  async removeCardFromUserAsync(userId, cardId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get user by ID
   * @param {number} userId
   * @returns {Promise<UserModel|null>}
   */
  async getUserByIdAsync(userId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get user transactions grouped by cards
   * @param {number} userId
   * @param {boolean} [includeInactive=false]
   * @param {Date|null} [fromDate=null]
   * @param {Date|null} [toDate=null]
   * @returns {Promise<UserTransactionsByCardsResponse|null>}
   */
  async getUserTransactionsByCardsAsync(userId, includeInactive = false, fromDate = null, toDate = null) {
    throw new Error('Method must be implemented');
  }
}

module.exports = ISimpleRepository;