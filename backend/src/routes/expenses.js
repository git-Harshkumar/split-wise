import { Router } from 'express';
import { createExpenseSchema } from '../validators/schemas.js';
import * as expensesService from '../services/expensesService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const expenses = await expensesService.getExpenses(req.user.id, { groupId });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { description, amount, payerId, groupId, participantIds, expenseDate } = createExpenseSchema.parse(req.body);
    const expense = await expensesService.createExpense(req.user.id, {
      description,
      amount,
      payerId,
      groupId,
      participantIds,
      expenseDate
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await expensesService.deleteExpense(req.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;