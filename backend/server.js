const express = require('express');
const db = require('./models');
const routes = require('./routes');
const cors = require('cors');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors("*"));

// Routes
app.use('/api', routes);

// Start the server with database sync
const startServer = async () => {
  try {
    // Sync database
    await db.sync();
    logger.info('Database synced successfully');

    // Start server
    app.listen(port, () => {
      logger.info(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
