// TypeScript-style interfaces for Node.js (using JSDoc comments for type safety)

/**
 * @typedef {Object} UserModel
 * @property {number} id
 * @property {string} email
 * @property {string|null} name
 * @property {string|null} phone
 * @property {string|null} username
 * @property {string|null} password
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {UserCardModel[]} [cards]
 */

/**
 * @typedef {Object} TransactionModel
 * @property {number} id
 * @property {string} cardId
 * @property {string|null} ageCat
 * @property {Date} trxDate
 * @property {number} trxAmount
 * @property {string|null} trxDesc
 * @property {string|null} trxCity
 * @property {string|null} trxCountry
 * @property {string|null} mccGroup
 * @property {boolean} isCardPresent
 * @property {boolean} isPurchase
 * @property {boolean} isCash
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} UserCardModel
 * @property {number} id
 * @property {string} cardId
 * @property {string|null} cardName
 * @property {number} userId
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {UserModel} [user]
 * @property {TransactionModel[]} [transactions]
 */

/**
 * @typedef {Object} ImportResult
 * @property {number} totalRecords
 * @property {number} successfulImports
 * @property {number} failedImports
 * @property {string[]} errors
 * @property {Date} importDate
 */

/**
 * @typedef {Object} CardTransactionGroup
 * @property {string} cardId
 * @property {string|null} cardName
 * @property {boolean} isActive
 * @property {TransactionModel[]} transactions
 * @property {number} transactionCount
 * @property {number} totalAmount
 */

/**
 * @typedef {Object} UserTransactionsByCardsResponse
 * @property {number} userId
 * @property {CardTransactionGroup[]} cards
 * @property {number} totalTransactions
 * @property {number} totalAmount
 * @property {number} cardCount
 * @property {Date|null} fromDate
 * @property {Date|null} toDate
 * @property {boolean} includeInactive
 */

module.exports = {
  // Export types for JSDoc reference
};