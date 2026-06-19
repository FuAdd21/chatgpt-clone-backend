import 'dotenv/config'
import express from 'express';
import db from './db/db.config.js';
import cors from 'cors';
import mainRouter from './src/api/main.routes.js'
import { errorHandler } from './src/middleware/error-handler.js';

const app = express();




const allowedOrigins = [
  'http://localhost:5173',
  'https://chatgpt-clone-frontend-mu.vercel.app',
  'https://vercel.app'
];

app.use(
  cors({
    origin: allowedOrigins, // Passing the array directly fixes the function edge-case failures
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
