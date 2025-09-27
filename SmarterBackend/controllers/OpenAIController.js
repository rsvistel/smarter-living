const BaseController = require('./BaseController');
const OpenAI = require('openai');

/**
 * OpenAIController handles OpenAI chat completion operations
 */
class OpenAIController extends BaseController {
  constructor(repository) {
    super(repository);

    // Initialize OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not found in environment variables');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Chat completion endpoint that takes a string and returns an array of strings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  chatCompletion = this.asyncHandler(async (req, res) => {
    try {
      // Validate OpenAI client
      if (!this.openai) {
        return this.sendError(res, 'OpenAI API key not configured', null, 500);
      }

      // Validate input
      const { message } = req.body;
      const missingFields = this.validateRequiredFields(req.body, ['message']);

      if (missingFields.length > 0) {
        return this.sendValidationError(res, 'Missing required fields', missingFields);
      }

      if (typeof message !== 'string' || message.trim().length === 0) {
        return this.sendValidationError(res, 'Message must be a non-empty string');
      }

      // Call OpenAI Chat Completion API with custom fine-tuned model
      const completion = await this.openai.chat.completions.create({
        model: "ft:gpt-4.1-mini-2025-04-14:danyloswiss:mini-tuned:CKL8ckxL",
        messages: [
          {
            role: "developer",
            content: "You are a helpful assistant. Please provide your response as a JSON array of strings. Each string should be a separate insight, suggestion, or piece of information related to the user's message. Return only the JSON array, no additional text."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        store: true,
      });

      // Extract response content
      const responseContent = completion.choices[0]?.message?.content;

      if (!responseContent) {
        return this.sendError(res, 'No response received from OpenAI', null, 500);
      }

      // Parse the response as JSON array
      let responseArray;
      try {
        responseArray = JSON.parse(responseContent);

        // Ensure it's an array
        if (!Array.isArray(responseArray)) {
          // If not an array, wrap the response in an array
          responseArray = [responseContent];
        }

        // Ensure all elements are strings
        responseArray = responseArray.map(item => String(item));

      } catch (parseError) {
        // If parsing fails, return the raw response as a single string in an array
        responseArray = [responseContent];
      }

      // Send the array of responses directly
      res.json(responseArray);

    } catch (error) {
      console.error('Error in chatCompletion:', error);

      // Handle specific OpenAI errors
      if (error?.status === 401) {
        return this.sendError(res, 'Invalid OpenAI API key', error, 401);
      } else if (error?.status === 429) {
        return this.sendError(res, 'OpenAI API rate limit exceeded', error, 429);
      } else if (error?.status === 400) {
        return this.sendError(res, 'Invalid request to OpenAI API', error, 400);
      }

      this.sendError(res, 'Failed to process chat completion', error);
    }
  });

  /**
   * Health check endpoint for OpenAI integration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  healthCheck = this.asyncHandler(async (req, res) => {
    try {
      const status = {
        openaiConfigured: !!this.openai,
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
      };

      if (this.openai) {
        // Test with a simple API call
        try {
          await this.openai.models.list();
          status.connectionStatus = 'success';
        } catch (error) {
          status.connectionStatus = 'failed';
          status.connectionError = error.message;
        }
      } else {
        status.connectionStatus = 'not_configured';
      }

      this.sendSuccess(res, status, 'OpenAI health check completed');

    } catch (error) {
      console.error('Error in healthCheck:', error);
      this.sendError(res, 'Health check failed', error);
    }
  });
}

module.exports = OpenAIController;