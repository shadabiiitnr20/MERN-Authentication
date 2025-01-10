import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
//
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js';
//
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

//For handling cors issue
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

//To parse the incoming requests (req.body). This middleware needs to be before all other middlewares
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started on PORT : ${PORT}`);
});
