import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Store your connection string in an environment variable
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  const { method } = req;

  try {
    await client.connect();
    const database = client.db('recipeApp');
    const commentsCollection = database.collection('comments');

    if (method === 'GET') {
      // Fetch comments for a specific recipe
      const recipeId = req.query.recipeId;
      const comments = await commentsCollection.find({ recipeId }).toArray();
      res.status(200).json(comments);
    } else if (method === 'POST') {
      // Add a new comment to a specific recipe
      const { recipeId, name, comment } = req.body;
      const newComment = { recipeId, name, comment, date: new Date() };
      const result = await commentsCollection.insertOne(newComment);
      res.status(201).json({ message: 'Comment added', commentId: result.insertedId });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  } finally {
    await client.close();
  }
}
