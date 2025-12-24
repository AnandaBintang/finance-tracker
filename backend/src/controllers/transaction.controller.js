import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const userId = req.userId;

    // Validation
    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'Type, amount, and category are required' });
    }

    if (!['income', 'expense', 'saving'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income, expense, or saving' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: parseFloat(amount),
        category,
        description: description || null,
        date: date ? new Date(date) : new Date()
      }
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, startDate, endDate, category } = req.query;

    // Build filter
    const where = { userId };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });

    // Calculate summary
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      totalSaving: 0,
      balance: 0
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        summary.totalExpense += transaction.amount;
      } else if (transaction.type === 'saving') {
        summary.totalSaving += transaction.amount;
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpense - summary.totalSaving;

    res.json({
      transactions,
      summary
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { type, amount, category, description, date } = req.body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Build update data
    const updateData = {};

    if (type) {
      if (!['income', 'expense', 'saving'].includes(type)) {
        return res.status(400).json({ error: 'Type must be income, expense, or saving' });
      }
      updateData.type = type;
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }
      updateData.amount = parseFloat(amount);
    }

    if (category) {
      updateData.category = category;
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    if (date) {
      updateData.date = new Date(date);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
