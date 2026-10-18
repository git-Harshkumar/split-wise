import { Router } from 'express';
import { importSchema } from '../validators/schemas.js';
import * as settingsService from '../services/settingsService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await settingsService.exportAllData(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/import', async (req, res, next) => {
  try {
    const importData = importSchema.parse(req.body);
    const result = await settingsService.importAllData(req.user.id, importData);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;