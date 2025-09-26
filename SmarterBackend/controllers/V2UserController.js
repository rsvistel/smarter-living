const BaseController = require('./BaseController');

/**
 * V2UserController - matches C# UserController API for compatibility
 */
class V2UserController extends BaseController {
  constructor(repository) {
    super(repository);
  }

  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUsers = this.asyncHandler(async (req, res) => {
    try {
      const users = await this.repository.getUserAsync();
      res.json(users);
    } catch (error) {
      console.error('Error in getUsers:', error);
      this.sendError(res, 'Failed to retrieve users', error);
    }
  });

  /**
   * Create user with username and email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createUser = this.asyncHandler(async (req, res) => {
    try {
      const { username, email } = req.body;

      if (!username || !email || username.trim() === '' || email.trim() === '') {
        return res.status(400).json({ message: 'Username and email are required' });
      }

      const user = await this.repository.createUserWithEmailAsync(username.trim(), email.trim());

      // Return with 201 Created and location header similar to C# CreatedAtAction
      res.status(201).json(user);
    } catch (error) {
      console.error('Error in createUser:', error);

      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      this.sendError(res, 'Failed to create user', error);
    }
  });

  /**
   * Create detailed user with extended fields
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createDetailedUser = this.asyncHandler(async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        country,
        city,
        address,
        postalCode,
        preferredCurrency,
        preferredLanguage
      } = req.body;

      // Validation similar to C# controller
      if (!firstName || !email || firstName.trim() === '' || email.trim() === '') {
        return res.status(400).json({ message: 'FirstName and Email are required' });
      }

      const finalPreferredCurrency = !preferredCurrency || preferredCurrency.trim() === ''
        ? 'USD'
        : preferredCurrency.trim().toUpperCase();

      if (finalPreferredCurrency.length !== 3) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: { preferredCurrency: 'Preferred currency must be a 3-letter ISO code.' }
        });
      }

      const finalPreferredLanguage = !preferredLanguage || preferredLanguage.trim() === ''
        ? 'EN'
        : preferredLanguage.trim();

      if (finalPreferredLanguage.length < 2 || finalPreferredLanguage.length > 5) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: { preferredLanguage: 'Preferred language must be between 2 and 5 characters.' }
        });
      }

      // Create user object with extended fields
      const userModel = {
        email: email.trim(),
        name: firstName.trim(),
        phone: phoneNumber,
        // Note: Extended fields like dateOfBirth, country, etc. would need database schema updates
        // For now, we'll store what we can with current schema
      };

      const user = await this.repository.createUserWithObjectAsync(userModel);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error in createDetailedUser:', error);

      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Email or username already exists' });
      }

      this.sendError(res, 'Failed to create detailed user', error);
    }
  });

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUser = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const user = await this.repository.getUserByIdAsync(userId);

      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      res.json(user);
    } catch (error) {
      console.error('Error in getUser:', error);
      this.sendError(res, 'Failed to retrieve user', error);
    }
  });

  /**
   * Add card to user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  addCardToUser = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { cardId, cardName } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      if (!cardId || !cardName || cardId.trim() === '' || cardName.trim() === '') {
        return res.status(400).json({ message: 'CardId and CardName are required' });
      }

      try {
        const userCard = await this.repository.addCardToUserAsync(userId, cardId.trim(), cardName.trim());
        res.status(201).json(userCard);
      } catch (error) {
        // Handle specific repository errors that would be InvalidOperationException in C#
        if (error.message.includes('User') && error.message.includes('not found')) {
          return res.status(404).json({ message: error.message });
        }
        if (error.code === 'P2002') {
          return res.status(400).json({ message: 'Card already exists for this user' });
        }
        throw error; // Re-throw for general error handling
      }
    } catch (error) {
      console.error('Error in addCardToUser:', error);
      this.sendError(res, 'Failed to add card to user', error);
    }
  });

  /**
   * Get user cards
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserCards = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      // Check if user exists first (matching C# behavior)
      const user = await this.repository.getUserByIdAsync(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      const cards = await this.repository.getUserCardsAsync(userId);
      res.json(cards);
    } catch (error) {
      console.error('Error in getUserCards:', error);
      this.sendError(res, 'Failed to retrieve user cards', error);
    }
  });

  /**
   * Get specific user card
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserCard = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { cardId } = req.params;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const userCard = await this.repository.getUserCardAsync(userId, cardId);

      if (!userCard) {
        return res.status(404).json({ message: `Card ${cardId} not found for user ${userId}` });
      }

      res.json(userCard);
    } catch (error) {
      console.error('Error in getUserCard:', error);
      this.sendError(res, 'Failed to retrieve user card', error);
    }
  });

  /**
   * Remove card from user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  removeCardFromUser = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { cardId } = req.params;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const success = await this.repository.removeCardFromUserAsync(userId, cardId);

      if (!success) {
        return res.status(404).json({ message: `Card ${cardId} not found for user ${userId}` });
      }

      res.status(204).send(); // No Content - matching C# NoContent() response
    } catch (error) {
      console.error('Error in removeCardFromUser:', error);
      this.sendError(res, 'Failed to remove card from user', error);
    }
  });

  /**
   * Get user transactions grouped by cards
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTransactionsByUser = this.asyncHandler(async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const includeInactive = req.query.includeInactive === 'true';
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
      const toDate = req.query.toDate ? new Date(req.query.toDate) : null;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const result = await this.repository.getUserTransactionsByCardsAsync(
        userId,
        includeInactive,
        fromDate,
        toDate
      );

      if (!result) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }

      // Transform response to match C# UserTransactionsByCardsResponse format
      const transformedResponse = {
        userId: result.userId,
        userName: '', // Would need to get from user record
        userEmail: '', // Would need to get from user record
        cards: result.cards.map(card => ({
          id: card.id || 0,
          userId: result.userId,
          cardId: card.cardId,
          cardName: card.cardName || card.cardId,
          isActive: card.isActive,
          createdAt: card.createdAt || new Date(),
          transactions: card.transactions.map(tx => ({
            cardId: tx.cardId,
            ageCategory: tx.ageCat || '',
            transactionDate: tx.trxDate,
            transactionCode: '', // Not available in current schema
            transactionAmount: parseFloat(tx.trxAmount || 0),
            transactionCurrency: 'USD', // Default currency
            transactionDescription: tx.trxDesc || '',
            transactionCity: tx.trxCity || '',
            transactionCountry: tx.trxCountry || '',
            transactionMcc: '', // Not available in current schema
            mccDescription: '', // Not available in current schema
            mccGroup: tx.mccGroup || '',
            isCardPresent: tx.isCardPresent || false,
            isPurchase: tx.isPurchase || false,
            isCash: tx.isCash || false,
            limitExhaustionCategory: '' // Not available in current schema
          })),
          transactionCount: card.transactions.length,
          totalAmount: card.transactions.reduce((sum, tx) => sum + parseFloat(tx.trxAmount || 0), 0)
        })),
        totalTransactions: result.totalTransactions,
        totalAmount: result.totalAmount,
        activeCardsCount: result.cards.filter(card => card.isActive).length,
        reportGeneratedAt: new Date()
      };

      res.json(transformedResponse);
    } catch (error) {
      console.error('Error in getTransactionsByUser:', error);
      this.sendError(res, 'Failed to retrieve user transactions', error);
    }
  });
}

module.exports = V2UserController;