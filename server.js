const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/db');
const Comment = require('./models/Comment');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    sequelize.sync(); // Sync the models (creates tables if they don't exist)
  })
  .catch((err) => console.log('Error: ' + err));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
