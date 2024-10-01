const { Sequelize } = require('sequelize');

// Set up a Sequelize instance for SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // This is the SQLite database file
});

module.exports = sequelize;
