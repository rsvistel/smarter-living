const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const { apiReference } = require('@scalar/express-api-reference');
const DataReader = require('./services/DataReader');

const app = express();
const PORT = process.env.PORT || 3000;
const dataReader = new DataReader();

// User-Card mapping configuration
const USER_CARD_MAPPING = {
  1: ["4128JIQVBMMD8200"],
  2: ["4164XFDCVUSR4148", "4170DWYZLBMQ1776"],
  3: ["4240ZXIAGHNR1012", "4242ZUQBAXVW5738", "4258MASFXRIZ7580"]
};

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Simple Node.js API',
    version: '1.0.0',
    description: 'A simple Express API with hello world endpoint',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Returns a hello world message
 *     description: Simple endpoint that returns a JSON response with a hello world message
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello World!
 */
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

/**
 * @swagger
 * /transactions/count:
 *   get:
 *     summary: Returns the count of loaded transactions
 *     description: Returns the total number of transaction objects loaded from the CSV file
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 1500
 *                 isLoaded:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Error loading data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to load transaction data
 */
app.get('/transactions/count', async (req, res) => {
  try {
    if (!dataReader.isLoaded()) {
      await dataReader.loadData();
    }

    res.json({
      count: dataReader.getTransactionCount(),
      isLoaded: dataReader.isLoaded()
    });
  } catch (error) {
    console.error('Error loading transaction data:', error);
    res.status(500).json({
      error: 'Failed to load transaction data'
    });
  }
});

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Returns the first 20 transactions
 *     description: Returns a list of the first 20 transaction objects from the loaded CSV data
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cardId:
 *                         type: string
 *                         example: "4302MAHICMDU4149"
 *                       ageCat:
 *                         type: string
 *                         example: "50-59"
 *                       trxDate:
 *                         type: string
 *                         example: "2024-08-04"
 *                       trxAmount:
 *                         type: number
 *                         example: 15.7
 *                       trxDesc:
 *                         type: string
 *                         example: "bahnhofkiosk"
 *                       trxCity:
 *                         type: string
 *                         example: "Davos Platz"
 *                       trxCountry:
 *                         type: string
 *                         example: "CHE"
 *                       mccGroup:
 *                         type: string
 *                         example: "Retail Stores"
 *                 count:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 9745
 *       500:
 *         description: Error loading data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to load transaction data
 */
app.get('/transactions', async (req, res) => {
  try {
    if (!dataReader.isLoaded()) {
      await dataReader.loadData();
    }

    const allTransactions = dataReader.getTransactions();
    const first20 = allTransactions.slice(0, 20);

    res.json({
      transactions: first20,
      count: first20.length,
      total: allTransactions.length
    });
  } catch (error) {
    console.error('Error loading transaction data:', error);
    res.status(500).json({
      error: 'Failed to load transaction data'
    });
  }
});

/**
 * @swagger
 * /transactions/card/{cardId}:
 *   get:
 *     summary: Returns all transactions for a specific card ID
 *     description: Returns all transaction objects for the specified card ID from the loaded CSV data
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: The card ID to filter transactions by
 *         schema:
 *           type: string
 *           example: "4302MAHICMDU4149"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cardId:
 *                   type: string
 *                   example: "4302MAHICMDU4149"
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cardId:
 *                         type: string
 *                         example: "4302MAHICMDU4149"
 *                       ageCat:
 *                         type: string
 *                         example: "50-59"
 *                       trxDate:
 *                         type: string
 *                         example: "2024-08-04"
 *                       trxAmount:
 *                         type: number
 *                         example: 15.7
 *                       trxDesc:
 *                         type: string
 *                         example: "bahnhofkiosk"
 *                       trxCity:
 *                         type: string
 *                         example: "Davos Platz"
 *                       trxCountry:
 *                         type: string
 *                         example: "CHE"
 *                       mccGroup:
 *                         type: string
 *                         example: "Retail Stores"
 *                 count:
 *                   type: integer
 *                   example: 25
 *       404:
 *         description: No transactions found for the specified card ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No transactions found for card ID
 *                 cardId:
 *                   type: string
 *                   example: "INVALID_CARD_ID"
 *       500:
 *         description: Error loading data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to load transaction data
 */
app.get('/transactions/card/:cardId', async (req, res) => {
  try {
    if (!dataReader.isLoaded()) {
      await dataReader.loadData();
    }

    const cardId = req.params.cardId;
    const allTransactions = dataReader.getTransactions();
    const cardTransactions = allTransactions.filter(transaction => transaction.cardId === cardId);

    if (cardTransactions.length === 0) {
      return res.status(404).json({
        error: 'No transactions found for card ID',
        cardId: cardId
      });
    }

    res.json({
      cardId: cardId,
      transactions: cardTransactions,
      count: cardTransactions.length
    });
  } catch (error) {
    console.error('Error loading transaction data:', error);
    res.status(500).json({
      error: 'Failed to load transaction data'
    });
  }
});

/**
 * @swagger
 * /cards:
 *   get:
 *     summary: Returns all unique card IDs
 *     description: Returns a list of all unique card IDs found in the transaction data
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cardIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "4302MAHICMDU4149"
 *                   description: Array of unique card IDs
 *                 count:
 *                   type: integer
 *                   example: 15
 *                   description: Total number of unique card IDs
 *       500:
 *         description: Error loading data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to load transaction data
 */
app.get('/cards', async (req, res) => {
  try {
    if (!dataReader.isLoaded()) {
      await dataReader.loadData();
    }

    const allTransactions = dataReader.getTransactions();
    const uniqueCardIds = [...new Set(allTransactions.map(transaction => transaction.cardId))];

    res.json({
      cardIds: uniqueCardIds.sort(),
      count: uniqueCardIds.length
    });
  } catch (error) {
    console.error('Error loading transaction data:', error);
    res.status(500).json({
      error: 'Failed to load transaction data'
    });
  }
});

/**
 * @swagger
 * /users/transactions:
 *   get:
 *     summary: Returns all transactions for a user grouped by cards
 *     description: Returns transactions for all cards associated with the specified user ID, grouped by card
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: The user ID (1, 2, or 3)
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *           example: 1
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cardId:
 *                         type: string
 *                         example: "4128JIQVBMMD8200"
 *                       transactions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             cardId:
 *                               type: string
 *                               example: "4128JIQVBMMD8200"
 *                             ageCat:
 *                               type: string
 *                               example: "50-59"
 *                             trxDate:
 *                               type: string
 *                               example: "2024-08-04"
 *                             trxAmount:
 *                               type: number
 *                               example: 15.7
 *                             trxDesc:
 *                               type: string
 *                               example: "bahnhofkiosk"
 *                             trxCity:
 *                               type: string
 *                               example: "Davos Platz"
 *                             trxCountry:
 *                               type: string
 *                               example: "CHE"
 *                             mccGroup:
 *                               type: string
 *                               example: "Retail Stores"
 *                       transactionCount:
 *                         type: integer
 *                         example: 25
 *                 totalTransactions:
 *                   type: integer
 *                   example: 25
 *                 cardCount:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: User not found or no transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *                 userId:
 *                   type: integer
 *                   example: 999
 *       500:
 *         description: Error loading data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to load transaction data
 */
app.get('/users/transactions', async (req, res) => {
  try {
    if (!dataReader.isLoaded()) {
      await dataReader.loadData();
    }

    const userId = parseInt(req.query.userId);

    // Validate user ID exists in mapping
    if (!USER_CARD_MAPPING[userId]) {
      return res.status(404).json({
        error: 'User not found',
        userId: userId
      });
    }

    const userCardIds = USER_CARD_MAPPING[userId];
    const allTransactions = dataReader.getTransactions();

    // Group transactions by card ID
    const cardGroups = [];
    let totalTransactions = 0;

    for (const cardId of userCardIds) {
      const cardTransactions = allTransactions.filter(transaction => transaction.cardId === cardId);

      if (cardTransactions.length > 0) {
        cardGroups.push({
          cardId: cardId,
          transactions: cardTransactions,
          transactionCount: cardTransactions.length
        });
        totalTransactions += cardTransactions.length;
      }
    }

    res.json({
      userId: userId,
      cards: cardGroups,
      totalTransactions: totalTransactions,
      cardCount: cardGroups.length
    });
  } catch (error) {
    console.error('Error loading transaction data:', error);
    res.status(500).json({
      error: 'Failed to load transaction data'
    });
  }
});

app.use(
  '/docs',
  apiReference({
    theme: 'kepler',
    spec: {
      content: swaggerSpec,
    },
  }),
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/docs`);
});