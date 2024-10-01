const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the Comment model
const Comment = sequelize.define('Comment', {
  recipeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  commentText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Comment;
