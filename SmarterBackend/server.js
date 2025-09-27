require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const { apiReference } = require('@scalar/express-api-reference');
const { Pool } = require('pg');
const { PrismaClient } = require('./generated/prisma');
const SimpleRepository = require('./repositories/SimpleRepository');
const DataReader = require('./services/DataReader');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Controllers
const UserController = require('./controllers/UserController');
const TransactionController = require('./controllers/TransactionController');
const CardController = require('./controllers/CardController');
const V2UserController = require('./controllers/V2UserController');

const app = express();
const PORT = process.env.PORT || 8000;
const dataReader = new DataReader();

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Enable CORS for all routes - MUST be before route definitions
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// User-Card mapping configuration
const USER_CARD_MAPPING = {
  1: ["4128JIQVBMMD8200"],
  2: ["4164XFDCVUSR4148", "4170DWYZLBMQ1776"],
  3: ["4240ZXIAGHNR1012", "4242ZUQBAXVW5738", "4258MASFXRIZ7580"]
};

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Prisma client
const prisma = new PrismaClient();

// Simple Repository instance
const simpleRepository = new SimpleRepository();

// Initialize Controllers
const userController = new UserController(simpleRepository);
const transactionController = new TransactionController(simpleRepository);
const cardController = new CardController(simpleRepository);
const v2UserController = new V2UserController(simpleRepository);

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
  tags: [
    {
      name: 'Introduction',
      description: 'Basic endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Transactions',
      description: 'Transaction management endpoints'
    },
    {
      name: 'Cards',
      description: 'Card management endpoints'
    },
    {
      name: 'Legacy',
      description: 'Legacy CSV-based endpoints'
    },
    {
      name: 'Database',
      description: 'Database testing endpoints'
    },
    {
      name: 'v2',
      description: 'V2 API endpoints (C# controller compatibility)'
    }
  ]
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
 *     tags: [Introduction]
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
 *     tags: [Legacy]
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
 *     tags: [Legacy]
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
 *     tags: [Legacy]
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
 *     tags: [Legacy]
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

    // Get all card IDs that are already assigned to users
    const assignedCards = await prisma.card.findMany({
      select: {
        cardId: true
      }
    });
    const assignedCardIds = new Set(assignedCards.map(card => card.cardId));

    // Filter out assigned cards to get only unassigned cards
    const unassignedCardIds = uniqueCardIds.filter(cardId => !assignedCardIds.has(cardId));

    // Count transactions per unassigned card
    const cardDetails = unassignedCardIds.map(cardId => {
      const transactionCount = allTransactions.filter(transaction => transaction.cardId === cardId).length;
      return {
        cardId,
        transactionCount
      };
    }).sort((a, b) => a.cardId.localeCompare(b.cardId));

    res.json({
      cards: cardDetails,
      count: unassignedCardIds.length
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
app.get('/users/transactions', authenticateToken, async (req, res) => {
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

/**
 * @swagger
 * /db/ping:
 *   get:
 *     tags: [Database]
 *     summary: Test database connection
 *     description: Attempts to connect to the PostgreSQL database and returns connection status
 *     responses:
 *       200:
 *         description: Database connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Database connection successful
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T12:00:00.000Z
 *       500:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Database connection failed
 *                 error:
 *                   type: string
 *                   example: Connection timeout
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T12:00:00.000Z
 */
app.get('/db/ping', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    res.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Database]
 *     summary: Get all users (Prisma demo)
 *     description: Returns all users from the database using Prisma ORM
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Database error
 *   post:
 *     summary: Create a new user (Prisma demo)
 *     description: Creates a new user using Prisma ORM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Database error
 */
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        cards: true
      }
    });

    res.json({
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email, name, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       500:
 *         description: Internal server error
 */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Internal server error
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Return user without password + token
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user from token
 *     description: Returns the current authenticated user's information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /users/cards:
 *   post:
 *     summary: Add a card to user's account
 *     description: Associates a card ID with the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *             properties:
 *               cardId:
 *                 type: string
 *                 example: "4240ZXIAGHNR1012"
 *     responses:
 *       201:
 *         description: Card added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Card added successfully
 *                 card:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     cardId:
 *                       type: string
 *                       example: "4240ZXIAGHNR1012"
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid input or card already exists
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
app.post('/users/cards', authenticateToken, async (req, res) => {
  try {
    const { cardId } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!cardId) {
      return res.status(400).json({
        message: 'Card ID is required'
      });
    }

    // Check if card already exists for this user
    const existingCard = await prisma.card.findFirst({
      where: {
        cardId: cardId,
        userId: userId
      }
    });

    if (existingCard) {
      return res.status(400).json({
        message: 'Card already added to your account'
      });
    }

    // Add card to user's account
    const newCard = await prisma.card.create({
      data: {
        cardId: cardId,
        userId: userId,
        isActive: true
      }
    });

    res.status(201).json({
      message: 'Card added successfully',
      card: newCard
    });
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /users/me/transactions:
 *   get:
 *     summary: Get authenticated user's cards and transactions
 *     description: Returns all cards and transactions for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cards and transactions retrieved successfully
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
 *                         example: "4240ZXIAGHNR1012"
 *                       transactions:
 *                         type: array
 *                         items:
 *                           type: object
 *                       transactionCount:
 *                         type: integer
 *                         example: 25
 *                 totalTransactions:
 *                   type: integer
 *                   example: 75
 *                 cardCount:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 *       404:
 *         description: User has no cards
 *       500:
 *         description: Internal server error
 */
app.get('/users/me/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!dataReader.isLoaded()) {
      await dataReader.loadData();
    }

    // Get user's cards from database
    const userCards = await prisma.card.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      select: {
        cardId: true
      }
    });

    if (userCards.length === 0) {
      return res.status(404).json({
        message: 'No cards found for user',
        userId: userId,
        cards: [],
        totalTransactions: 0,
        cardCount: 0
      });
    }

    // Extract card IDs
    const userCardIds = userCards.map(card => card.cardId);
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
      } else {
        // Include cards even if they have no transactions
        cardGroups.push({
          cardId: cardId,
          transactions: [],
          transactionCount: 0
        });
      }
    }

    res.json({
      userId: userId,
      cards: cardGroups,
      totalTransactions: totalTransactions,
      cardCount: cardGroups.length
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the authenticated user and invalidates the session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid or expired token
 */
app.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const email = req.user.email;
    
    // Log the logout event for security audit
    console.log(`User logout: ${email} (ID: ${userId}) at ${new Date().toISOString()}`);
    
    // Note: With stateless JWT, we can't invalidate the token server-side
    // In production, you might want to:
    // 1. Add token to a blacklist/Redis cache
    // 2. Use shorter token expiration times
    // 3. Implement refresh token rotation
    
    res.json({
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         cardId:
 *           type: string
 *         trxDate:
 *           type: string
 *           format: date-time
 *         trxAmount:
 *           type: number
 *         trxDesc:
 *           type: string
 *     Card:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         cardId:
 *           type: string
 *         cardName:
 *           type: string
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User retrieved successfully
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */

/**
 * @swagger
 * /api/transactions/stats:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */

/**
 * @swagger
 * /api/users/{userId}/cards:
 *   get:
 *     tags: [Cards]
 *     summary: Get all cards for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cards retrieved successfully
 */

/**
 * @swagger
 * /api/v2/user:
 *   get:
 *     tags: [v2]
 *     summary: Get all users (V2 API)
 *     description: Returns all users from the database
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     tags: [v2]
 *     summary: Create user with username and email (V2 API)
 *     description: Creates a new user with username and email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Username and email are required
 */

/**
 * @swagger
 * /api/v2/user/detailed:
 *   post:
 *     tags: [v2]
 *     summary: Create detailed user (V2 API)
 *     description: Creates a new user with extended profile information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               preferredCurrency:
 *                 type: string
 *                 maxLength: 3
 *                 example: "USD"
 *               preferredLanguage:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 5
 *                 example: "EN"
 *     responses:
 *       201:
 *         description: Detailed user created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v2/user/{userId}:
 *   get:
 *     tags: [v2]
 *     summary: Get user by ID (V2 API)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v2/cards/{userId}:
 *   post:
 *     tags: [v2]
 *     summary: Add card to user (V2 API)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *               - cardName
 *             properties:
 *               cardId:
 *                 type: string
 *               cardName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Card added successfully
 *       400:
 *         description: CardId and CardName are required
 */

/**
 * @swagger
 * /api/v2/cards-by-user/{userId}:
 *   get:
 *     tags: [v2]
 *     summary: Get user cards (V2 API)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User cards retrieved successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v2/user/{userId}/transactions-by-user:
 *   get:
 *     tags: [v2]
 *     summary: Get user transactions by cards (V2 API)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: User transactions retrieved successfully
 *       404:
 *         description: User not found
 */

// Controller Routes
// User Routes
app.get('/api/users', userController.getAllUsers);
app.get('/api/users/:id', userController.getUserById);
app.post('/api/users', userController.createUser);
app.post('/api/users/object', userController.createUserWithObject);
app.get('/api/users/:id/transactions', userController.getUserTransactionsByCards);
app.get('/api/users/:id/stats', userController.getUserStats);

// Transaction Routes
app.get('/api/transactions', transactionController.getAllTransactions);
app.post('/api/transactions/import', transactionController.importTransactions);
app.get('/api/transactions/stats', transactionController.getTransactionStats);
app.get('/api/transactions/card/:cardId', transactionController.getTransactionsByCard);

// Card Routes
app.get('/api/users/:userId/cards', cardController.getUserCards);
app.get('/api/users/:userId/cards/:cardId', cardController.getUserCard);
app.post('/api/users/:userId/cards', cardController.addCardToUser);
app.delete('/api/users/:userId/cards/:cardId', cardController.removeCardFromUser);
app.get('/api/cards/:cardId/stats', cardController.getCardStats);

// V2 API Routes (C# Controller compatibility)
app.get('/api/v2/user', v2UserController.getUsers);
app.post('/api/v2/user', v2UserController.createUser);
app.post('/api/v2/user/detailed', v2UserController.createDetailedUser);
app.get('/api/v2/user/:userId', v2UserController.getUser);
app.post('/api/v2/cards/:userId', v2UserController.addCardToUser);
app.get('/api/v2/cards-by-user/:userId', v2UserController.getUserCards);
app.get('/api/v2/user/:userId/cards/:cardId', v2UserController.getUserCard);
app.delete('/api/v2/user/:userId/cards/:cardId', v2UserController.removeCardFromUser);
app.get('/api/v2/user/:userId/transactions-by-user', v2UserController.getTransactionsByUser);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name
      }
    });

    res.status(201).json({
      user: user
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /repository/users:
 *   get:
 *     summary: Get all users using SimpleRepository
 *     description: Demonstrates the repository pattern by getting all users through the SimpleRepository interface
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Database error
 */
app.get('/repository/users', async (req, res) => {
  try {
    const users = await simpleRepository.getUserAsync();

    res.json({
      users: users,
      count: users.length,
      message: 'Users retrieved using SimpleRepository pattern'
    });
  } catch (error) {
    console.error('Error in /repository/users:', error);
    res.status(500).json({
      error: 'Failed to fetch users through repository',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /repository/users/{userId}/transactions:
 *   get:
 *     summary: Get user transactions by cards using SimpleRepository
 *     description: Demonstrates the repository pattern by getting user transactions grouped by cards
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: integer
 *       - in: query
 *         name: includeInactive
 *         description: Include inactive cards
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */
app.get('/repository/users/:userId/transactions', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const includeInactive = req.query.includeInactive === 'true';

    const result = await simpleRepository.getUserTransactionsByCardsAsync(userId, includeInactive);

    if (!result) {
      return res.status(404).json({
        error: 'User not found or no transactions',
        userId: userId
      });
    }

    res.json({
      data: result,
      message: 'User transactions retrieved using SimpleRepository pattern'
    });
  } catch (error) {
    console.error('Error in /repository/users/:userId/transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch user transactions through repository',
      message: error.message
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