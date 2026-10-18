import { Router } from 'express';
import { createSettlementSchema } from '../validators/schemas.js';
import * as settlementsService from '../services/settlementsService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const settlements = await settlementsService.getSettlements(req.user.id);
    res.json(settlements);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { fromPersonId, toPersonId, amount, settlementDate } = createSettlementSchema.parse(req.body);
    const settlement = await settlementsService.createSettlement(req.user.id, {
      fromPersonId,
      toPersonId,
      amount,
      settlementDate
    });
    res.status(201).json(settlement);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await settlementsService.deleteSettlement(req.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;