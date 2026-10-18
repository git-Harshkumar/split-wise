import { Router } from 'express';
import * as balancesService from '../services/balancesService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const balances = await balancesService.getBalances(req.user.id);
    res.json(balances);
  } catch (err) {
    next(err);
  }
});

router.get('/simplified', async (req, res, next) => {
  try {
    const settlements = await balancesService.getSimplifiedSettlements(req.user.id);
    res.json(settlements);
  } catch (err) {
    next(err);
  }
});

router.get('/who-paid-what', async (req, res, next) => {
  try {
    const data = await balancesService.getWhoPaidWhat(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/trip-investment', async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const data = await balancesService.getTripInvestment(req.user.id, groupId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/what-each-spent', async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const data = await balancesService.getWhatEachPersonSpent(req.user.id, groupId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;