import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Goal } from '../models/Goal';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all goals
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: any = { userId: req.user?.id };

    if (category) {
      filter.category = category;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Get single goal
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// Create goal
router.post(
  '/',
  [
    body('category').isIn(['physical', 'mental', 'financial', 'career', 'relationships', 'learning', 'spiritual', 'fun']),
    body('title').trim().notEmpty(),
    body('description').optional().isString(),
    body('targetDate').optional().isISO8601(),
    body('milestones').optional().isArray()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const goal = new Goal({
        userId: req.user?.id,
        ...req.body
      });

      await goal.save();
      res.status(201).json({ goal });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create goal' });
    }
  }
);

// Update goal
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const { title, description, targetDate, milestones, linkedHabits } = req.body;

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (milestones) goal.milestones = milestones;
    if (linkedHabits) goal.linkedHabits = linkedHabits;

    await goal.save();
    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Mark milestone complete
router.post('/:id/milestone/:milestoneIndex', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const milestoneIndex = parseInt(req.params.milestoneIndex);
    if (milestoneIndex < 0 || milestoneIndex >= goal.milestones.length) {
      res.status(400).json({ error: 'Invalid milestone index' });
      return;
    }

    goal.milestones[milestoneIndex].completed = true;
    goal.milestones[milestoneIndex].completedAt = new Date();

    await goal.save();
    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Get overall progress dashboard data
router.get('/analytics/progress', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await Goal.find({ userId: req.user?.id });

    const byCategory = goals.reduce((acc: any, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = { count: 0, avgProgress: 0, totalProgress: 0 };
      }
      acc[goal.category].count++;
      acc[goal.category].totalProgress += goal.progress;
      return acc;
    }, {});

    Object.keys(byCategory).forEach(cat => {
      byCategory[cat].avgProgress = Math.round(
        byCategory[cat].totalProgress / byCategory[cat].count
      );
    });

    res.json({
      totalGoals: goals.length,
      byCategory,
      overallProgress: goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
});

export default router;
