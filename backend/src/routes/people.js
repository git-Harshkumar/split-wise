import { Router } from 'express';
import { createPersonSchema } from '../validators/schemas.js';
import * as peopleService from '../services/peopleService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const people = await peopleService.getPeople(req.user.id);
    res.json(people);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = createPersonSchema.parse(req.body);
    const person = await peopleService.createPerson(req.user.id, name);
    res.status(201).json(person);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await peopleService.checkPersonInUse(req.user.id, id);
    await peopleService.deletePerson(req.user.id, id);
    res.status(204).send();
  } catch (err) {
    if (err.message && err.message.includes('Cannot delete')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
});

export default router;