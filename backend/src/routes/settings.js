import { Router } from 'express';
import { updateProfileSchema } from '../validators/schemas.js';
import * as settingsService from '../services/settingsService.js';

const router = Router();

router.get('/profile', async (req, res, next) => {
  try {
    const profile = await settingsService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', async (req, res, next) => {
  try {
    const { displayName } = updateProfileSchema.parse(req.body);
    const profile = await settingsService.updateProfile(req.user.id, displayName);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.delete('/all-data', async (req, res, next) => {
  try {
    await settingsService.deleteAllUserData(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;