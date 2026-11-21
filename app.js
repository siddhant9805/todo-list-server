const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
