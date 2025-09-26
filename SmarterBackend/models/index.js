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

// V2 API Models (matching C# UserController)

/**
 * @typedef {Object} CreateUserRequest
 * @property {string} username
 * @property {string} email
 */

/**
 * @typedef {Object} CreateDetailedUserRequest
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string|null} phoneNumber
 * @property {Date} dateOfBirth
 * @property {string} country
 * @property {string} city
 * @property {string|null} address
 * @property {string|null} postalCode
 * @property {string|null} preferredCurrency
 * @property {string|null} preferredLanguage
 */

/**
 * @typedef {Object} AddCardRequest
 * @property {string} cardId
 * @property {string} cardName
 */

/**
 * @typedef {Object} UserModelV2
 * @property {number} id
 * @property {string} email
 * @property {string|null} firstName
 * @property {string|null} lastName
 * @property {string|null} phoneNumber
 * @property {Date|null} dateOfBirth
 * @property {string|null} country
 * @property {string|null} city
 * @property {string|null} address
 * @property {string|null} postalCode
 * @property {string|null} preferredCurrency
 * @property {string|null} preferredLanguage
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} TransactionModelV2
 * @property {string} cardId
 * @property {string} ageCategory
 * @property {Date} transactionDate
 * @property {string} transactionCode
 * @property {number} transactionAmount
 * @property {string} transactionCurrency
 * @property {string} transactionDescription
 * @property {string} transactionCity
 * @property {string} transactionCountry
 * @property {string} transactionMcc
 * @property {string} mccDescription
 * @property {string} mccGroup
 * @property {boolean} isCardPresent
 * @property {boolean} isPurchase
 * @property {boolean} isCash
 * @property {string} limitExhaustionCategory
 */

/**
 * @typedef {Object} UserCardWithTransactionsModel
 * @property {number} id
 * @property {number} userId
 * @property {string} cardId
 * @property {string} cardName
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {TransactionModelV2[]} transactions
 * @property {number} transactionCount
 * @property {number} totalAmount
 */

/**
 * @typedef {Object} UserTransactionsByCardsResponseV2
 * @property {number} userId
 * @property {string} userName
 * @property {string} userEmail
 * @property {UserCardWithTransactionsModel[]} cards
 * @property {number} totalTransactions
 * @property {number} totalAmount
 * @property {number} activeCardsCount
 * @property {Date} reportGeneratedAt
 */

module.exports = {
  // Export types for JSDoc reference
};