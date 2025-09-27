const { PrismaClient } = require('../generated/prisma');

class TransactionRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Insert multiple transactions into the database at once
   * @param {Array<Object>} transactionsData - Array of transaction data to insert
   * @param {string} transactionsData[].cardId - The card ID (references cards table)
   * @param {string} [transactionsData[].ageCat] - Age category
   * @param {Date} transactionsData[].trxDate - Transaction date
   * @param {number} transactionsData[].trxAmount - Transaction amount (up to 10 digits, 2 decimal places)
   * @param {string} [transactionsData[].trxDesc] - Transaction description
   * @param {string} [transactionsData[].trxCity] - Transaction city
   * @param {string} [transactionsData[].trxCountry] - Transaction country
   * @param {string} [transactionsData[].mccGroup] - MCC group
   * @param {boolean} [transactionsData[].isCardPresent=false] - Whether card was present
   * @param {boolean} [transactionsData[].isPurchase=false] - Whether it's a purchase
   * @param {boolean} [transactionsData[].isCash=false] - Whether it's a cash transaction
   * @returns {Promise<Object>} Object containing count of inserted transactions
   */
  async insertTransactions(transactionsData) {
    try {
      if (!Array.isArray(transactionsData)) {
        throw new Error('transactionsData must be an array');
      }

      if (transactionsData.length === 0) {
        return { count: 0 };
      }

      // Validate and prepare all data
      const preparedTransactions = transactionsData.map((transactionData, index) => {
        const {
          cardId,
          ageCat,
          trxDate,
          trxAmount,
          trxDesc,
          trxCity,
          trxCountry,
          mccGroup,
          isCardPresent = false,
          isPurchase = false,
          isCash = false
        } = transactionData;

        // Validate required fields
        if (!cardId) {
          throw new Error(`Record ${index}: cardId is required`);
        }
        if (!trxDate) {
          throw new Error(`Record ${index}: trxDate is required`);
        }
        if (trxAmount === undefined || trxAmount === null) {
          throw new Error(`Record ${index}: trxAmount is required`);
        }

        return {
          cardId,
          ageCat,
          trxDate: new Date(trxDate),
          trxAmount: parseFloat(trxAmount),
          trxDesc,
          trxCity,
          trxCountry,
          mccGroup,
          isCardPresent,
          isPurchase,
          isCash
        };
      });

      // Insert all transactions at once
      const result = await this.prisma.transaction.createMany({
        data: preparedTransactions,
        skipDuplicates: true
      });

      return { count: result.count };

    } catch (error) {
      console.error('Error inserting transactions:', error);
      throw error;
    }
  }

  /**
   * Insert a single transaction into the database
   * @param {Object} transactionData - The transaction data to insert
   * @returns {Promise<Object>} The created transaction
   */
  async insertTransaction(transactionData) {
    const result = await this.insertTransactions([transactionData]);

    if (result.errors.length > 0) {
      throw new Error(result.errors[0].error);
    }

    if (result.count === 0) {
      throw new Error('Failed to insert transaction');
    }

    // Return the created transaction by querying the most recent one for this card
    const transaction = await this.prisma.transaction.findFirst({
      where: { cardId: transactionData.cardId },
      orderBy: { createdAt: 'desc' }
    });

    return transaction;
  }

  /**
   * Get the total count of all transactions in the database
   * @returns {Promise<number>} Total number of transactions
   */
  async getCountAllTransactions() {
    try {
      const count = await this.prisma.transaction.count();
      return count;
    } catch (error) {
      console.error('Error counting all transactions:', error);
      throw error;
    }
  }

  /**
   * Get all transactions for a given card ID
   * @param {string} cardId - The card ID to filter transactions by
   * @returns {Promise<Array>} Array of all transactions for the card
   */
  async getTransactionsByCardId(cardId) {
    try {
      if (!cardId) {
        throw new Error('cardId is required');
      }

      const transactions = await this.prisma.transaction.findMany({
        where: {
          cardId: cardId
        },
        orderBy: {
          trxDate: 'desc'
        }
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by cardId:', error);
      throw error;
    }
  }

  /**
   * Get transaction count for a given card ID
   * @param {string} cardId - The card ID to count transactions for
   * @returns {Promise<number>} Number of transactions for the card
   */
  async getTransactionCountByCardId(cardId) {
    try {
      if (!cardId) {
        throw new Error('cardId is required');
      }

      const count = await this.prisma.transaction.count({
        where: {
          cardId: cardId
        }
      });

      return count;
    } catch (error) {
      console.error('Error counting transactions by cardId:', error);
      throw error;
    }
  }

  /**
   * Close the Prisma connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = TransactionRepository;