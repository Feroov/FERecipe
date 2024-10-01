const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/db');
const Comment = require('./models/Comment');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    sequelize.sync();
  })
  .catch((err) => console.log('Error: ' + err));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the recipe.json file
app.get('/recipes', (req, res) => {
  fs.readFile(path.join(__dirname, 'recipe.json'), 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load recipe data' });
    }
    res.json(JSON.parse(data)); // Send the parsed JSON data
  });
});

// POST: Add a comment to a specific recipe
app.post('/recipes/:recipeId/comments', async (req, res) => {
  const { recipeId } = req.params;
  const { name, commentText } = req.body;

  try {
    const newComment = await Comment.create({
      recipeId,
      name,
      commentText,
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// GET: Retrieve comments for a specific recipe
app.get('/recipes/:recipeId/comments', async (req, res) => {
  const { recipeId } = req.params;

  try {
    const comments = await Comment.findAll({ where: { recipeId } });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
