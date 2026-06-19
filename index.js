import 'dotenv/config'
import express from 'express';
import db from './db/db.config.js';
import cors from 'cors';
import mainRouter from './src/api/main.routes.js'
import { errorHandler } from './src/middleware/error-handler.js';

const app = express();

// index.js (Backend)

// Explicitly list your frontend URL versions
const allowedOrigins = [
  'http://localhost:5173',
  'https://vercel.app',
  'https://vercel.app/'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // 1. Allow internal requests, server-to-server, or tool requests (like Postman)
      if (!origin) return callback(null, true);
      
      // 2. Safely check if the incoming domain matches our allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        // Log out the exact origin that failed so you can see it in Render logs
        console.log(`CORS blocked an origin request from: ${origin}`);
        return callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);


app.use(express.json());
app.use('/api', mainRouter);

// Final middleware for error handling
app.use(errorHandler);

// Define PORT dynamically for production deployment
const PORT = process.env.PORT || 3888;

async function startServer() { 
    try {
        const connection = await db.getConnection();
        connection.release();

        console.log("Database connected successfully.");
        
        // Listen on the dynamic port instead of a hardcoded one
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

startServer();
