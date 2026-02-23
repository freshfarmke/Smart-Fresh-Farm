import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount admin routes
app.use('/admin', adminRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Bakery API Running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bakery API server running on http://localhost:${PORT}`);
});
