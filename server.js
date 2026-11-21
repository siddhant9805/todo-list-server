require('dotenv').config();

const app = require('./app');
const { port } = require('./config');

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Home / API Guide: http://localhost:${port}/`);
    console.log(`Protected tasks endpoint: http://localhost:${port}/tasks`);
  });
}

module.exports = app;
