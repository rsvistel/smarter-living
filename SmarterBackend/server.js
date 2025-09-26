const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const { apiReference } = require('@scalar/express-api-reference');
const DataReader = require('./services/DataReader');

const app = express();
const PORT = process.env.PORT || 3000;
const dataReader = new DataReader();

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