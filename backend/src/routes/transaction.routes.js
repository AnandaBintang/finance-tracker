import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transaction.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
