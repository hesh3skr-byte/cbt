import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Task } from '../models/Task';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// Get all tasks
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, quadrant } = req.query;
    const filter: any = { userId: req.user?.id };

    if (status) filter.status = status;
    if (quadrant) filter.eisenhowerQuadrant = quadrant;

    const tasks = await Task.find(filter).sort({ priority: -1, createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('description').optional().isString(),
    body('status').optional().isIn(['inbox', 'next', 'waiting', 'someday', 'done']),
    body('eisenhowerQuadrant').optional().isIn(['urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important']),
    body('priority').optional().isInt({ min: 1, max: 5 })
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const task = new Task({
        userId: req.user?.id,
        ...req.body
      });

      await task.save();
      res.status(201).json({ task });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// Update task
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get Eisenhower matrix view
router.get('/matrix/view', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({
      userId: req.user?.id,
      status: { $ne: 'done' },
      eisenhowerQuadrant: { $exists: true, $ne: null }
    });

    const matrix = {
      'urgent-important': tasks.filter(t => t.eisenhowerQuadrant === 'urgent-important'),
      'not-urgent-important': tasks.filter(t => t.eisenhowerQuadrant === 'not-urgent-important'),
      'urgent-not-important': tasks.filter(t => t.eisenhowerQuadrant === 'urgent-not-important'),
      'not-urgent-not-important': tasks.filter(t => t.eisenhowerQuadrant === 'not-urgent-not-important')
    };

    res.json({ matrix });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matrix' });
  }
});

// Get task statistics
router.get('/analytics/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allTasks = await Task.find({ userId: req.user?.id });
    const completedTasks = allTasks.filter(t => t.status === 'done');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = allTasks.filter(
      t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < today
    );

    res.json({
      total: allTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      completionRate: allTasks.length > 0
        ? Math.round((completedTasks.length / allTasks.length) * 100)
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
