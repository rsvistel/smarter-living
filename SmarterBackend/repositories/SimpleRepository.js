const ISimpleRepository = require('./ISimpleRepository');
const { PrismaClient } = require('../generated/prisma');

class SimpleRepository extends ISimpleRepository {
  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  /**
   * Get all users
   * @returns {Promise<UserModel[]>}
   */
  async getUserAsync() {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          cards: {
            include: {
              transactions: true
            }
          }
        }
      });
      return users;
    } catch (error) {
      console.error('Error in getUserAsync:', error);
      throw error;
    }
  }

  /**
   * Create user with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<UserModel>}
   */
  async createUserAsync(username, password) {
    try {
      const user = await this.prisma.user.create({
        data: {
          username,
          password,
          email: `${username}@temp.com` // Temporary email since it's required
        }
      });
      return user;
    } catch (error) {
      console.error('Error in createUserAsync:', error);
      throw error;
    }
  }

  /**
   * Create user with user object
   * @param {UserModel} user
   * @returns {Promise<UserModel>}
   */
  async createUserWithObjectAsync(user) {
    try {
      const createdUser = await this.prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          phone: user.phone,
          username: user.username,
          password: user.password
        }
      });
      return createdUser;
    } catch (error) {
      console.error('Error in createUserWithObjectAsync:', error);
      throw error;
    }
  }

  /**
   * Import transactions
   * @param {TransactionModel[]} transactions
   * @returns {Promise<ImportResult>}
   */
  async importTransactionsAsync(transactions) {
    const importResult = {
      totalRecords: transactions.length,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      importDate: new Date()
    };

    try {
      for (const transaction of transactions) {
        try {
          // Ensure the card exists first
          let card = await this.prisma.card.findUnique({
            where: { cardId: transaction.cardId }
          });

          if (!card) {
            // Create a temporary card if it doesn't exist
            card = await this.prisma.card.create({
              data: {
                cardId: transaction.cardId,
                cardName: `Card ${transaction.cardId}`,
                userId: 1, // Default user - you might want to handle this differently
                isActive: true
              }
            });
          }

          await this.prisma.transaction.create({
            data: {
              cardId: transaction.cardId,
              ageCat: transaction.ageCat,
              trxDate: new Date(transaction.trxDate),
              trxAmount: transaction.trxAmount,
              trxDesc: transaction.trxDesc,
              trxCity: transaction.trxCity,
              trxCountry: transaction.trxCountry,
              mccGroup: transaction.mccGroup,
              isCardPresent: transaction.isCardPresent || false,
              isPurchase: transaction.isPurchase || false,
              isCash: transaction.isCash || false
            }
          });

          importResult.successfulImports++;
        } catch (error) {
          importResult.failedImports++;
          importResult.errors.push(`Transaction ${importResult.successfulImports + importResult.failedImports}: ${error.message}`);
        }
      }

      return importResult;
    } catch (error) {
      console.error('Error in importTransactionsAsync:', error);
      importResult.errors.push(`General error: ${error.message}`);
      return importResult;
    }
  }

  /**
   * Get all transactions
   * @returns {Promise<TransactionModel[]>}
   */
  async getTransactionsAsync() {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: {
          card: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          trxDate: 'desc'
        }
      });
      return transactions;
    } catch (error) {
      console.error('Error in getTransactionsAsync:', error);
      throw error;
    }
  }

  /**
   * Add card to user
   * @param {number} userId
   * @param {string} cardId
   * @param {string} cardName
   * @returns {Promise<UserCardModel>}
   */
  async addCardToUserAsync(userId, cardId, cardName) {
    try {
      const card = await this.prisma.card.create({
        data: {
          cardId,
          cardName,
          userId,
          isActive: true
        },
        include: {
          user: true,
          transactions: true
        }
      });
      return card;
    } catch (error) {
      console.error('Error in addCardToUserAsync:', error);
      throw error;
    }
  }

  /**
   * Get user cards
   * @param {number} userId
   * @returns {Promise<UserCardModel[]>}
   */
  async getUserCardsAsync(userId) {
    try {
      const cards = await this.prisma.card.findMany({
        where: {
          userId: userId
        },
        include: {
          user: true,
          transactions: true
        }
      });
      return cards;
    } catch (error) {
      console.error('Error in getUserCardsAsync:', error);
      throw error;
    }
  }

  /**
   * Get specific user card
   * @param {number} userId
   * @param {string} cardId
   * @returns {Promise<UserCardModel|null>}
   */
  async getUserCardAsync(userId, cardId) {
    try {
      const card = await this.prisma.card.findFirst({
        where: {
          userId: userId,
          cardId: cardId
        },
        include: {
          user: true,
          transactions: true
        }
      });
      return card;
    } catch (error) {
      console.error('Error in getUserCardAsync:', error);
      throw error;
    }
  }

  /**
   * Remove card from user
   * @param {number} userId
   * @param {string} cardId
   * @returns {Promise<boolean>}
   */
  async removeCardFromUserAsync(userId, cardId) {
    try {
      const deletedCard = await this.prisma.card.deleteMany({
        where: {
          userId: userId,
          cardId: cardId
        }
      });
      return deletedCard.count > 0;
    } catch (error) {
      console.error('Error in removeCardFromUserAsync:', error);
      return false;
    }
  }

  /**
   * Get user by ID
   * @param {number} userId
   * @returns {Promise<UserModel|null>}
   */
  async getUserByIdAsync(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        include: {
          cards: {
            include: {
              transactions: true
            }
          }
        }
      });
      return user;
    } catch (error) {
      console.error('Error in getUserByIdAsync:', error);
      throw error;
    }
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
    try {
      const whereClause = {
        userId: userId
      };

      if (!includeInactive) {
        whereClause.isActive = true;
      }

      const cards = await this.prisma.card.findMany({
        where: whereClause,
        include: {
          transactions: {
            where: {
              ...(fromDate && { trxDate: { gte: fromDate } }),
              ...(toDate && { trxDate: { lte: toDate } })
            },
            orderBy: {
              trxDate: 'desc'
            }
          }
        }
      });

      const cardGroups = cards.map(card => ({
        cardId: card.cardId,
        cardName: card.cardName,
        isActive: card.isActive,
        transactions: card.transactions,
        transactionCount: card.transactions.length,
        totalAmount: card.transactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0)
      }));

      const response = {
        userId: userId,
        cards: cardGroups,
        totalTransactions: cardGroups.reduce((sum, card) => sum + card.transactionCount, 0),
        totalAmount: cardGroups.reduce((sum, card) => sum + card.totalAmount, 0),
        cardCount: cardGroups.length,
        fromDate: fromDate,
        toDate: toDate,
        includeInactive: includeInactive
      };

      return response;
    } catch (error) {
      console.error('Error in getUserTransactionsByCardsAsync:', error);
      throw error;
    }
  }

  /**
   * Close Prisma connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = SimpleRepository;