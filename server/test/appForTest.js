const express = require('express');
const cors = require('cors');
const forgivenessRoutes = require('../routes/forgivenessRoutes');
const healingRoutes = require('../routes/healingRoutes');
const { errorHandler } = require('../middleware/errorMiddleware');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/forgiveness', forgivenessRoutes);
  app.use('/api/healing', healingRoutes);

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
