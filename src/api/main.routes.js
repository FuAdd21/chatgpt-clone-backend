import express from 'express';
import chatRouter from './chat.routes.js'

const mainRouter = express.Router();

//  /api/chat
mainRouter.use('/chat', chatRouter);

// api/admin
// mainRouter.use('/admin', chatRouter);

export default mainRouter