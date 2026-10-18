import { Router } from 'express';
import { createGroupSchema, updateGroupSchema } from '../validators/schemas.js';
import * as groupsService from '../services/groupsService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const groups = await groupsService.getGroups(req.user.id);
    res.json(groups);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, icon, memberIds } = createGroupSchema.parse(req.body);
    const group = await groupsService.createGroup(req.user.id, { name, icon, memberIds });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = updateGroupSchema.parse(req.body);
    const group = await groupsService.updateGroup(req.user.id, id, updates);
    res.json(group);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await groupsService.deleteGroup(req.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;