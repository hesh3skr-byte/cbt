import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Habit } from '../models/Habit';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { startOfDay, subDays } from 'date-fns';

const router = express.Router();
router.use(authenticate);

// Get all habits
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json({ habits });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Get single habit
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    res.json({ habit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Create habit
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('icon').optional().isString(),
    body('frequency').isIn(['daily', 'weekly']),
    body('targetDays').optional().isArray(),
    body('linkedGoalId').optional().isString()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const habit = new Habit({
        userId: req.user?.id,
        ...req.body
      });

      await habit.save();
      res.status(201).json({ habit });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create habit' });
    }
  }
);

// Update habit
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const { name, icon, frequency, targetDays, linkedGoalId } = req.body;

    if (name) habit.name = name;
    if (icon) habit.icon = icon;
    if (frequency) habit.frequency = frequency;
    if (targetDays) habit.targetDays = targetDays;
    if (linkedGoalId !== undefined) habit.linkedGoalId = linkedGoalId;

    await habit.save();
    res.json({ habit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete habit
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Mark habit complete for a date
router.post('/:id/complete', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const { date, completed, note } = req.body;
    const completionDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());

    // Check if completion already exists for this date
    const existingIndex = habit.completions.findIndex(
      c => startOfDay(c.date).getTime() === completionDate.getTime()
    );

    if (existingIndex >= 0) {
      // Update existing completion
      habit.completions[existingIndex].completed = completed;
      habit.completions[existingIndex].note = note || '';
    } else {
      // Add new completion
      habit.completions.push({
        date: completionDate,
        completed,
        note: note || ''
      });
    }

    // Recalculate streak
    (habit as any).calculateStreak();

    await habit.save();
    res.json({ habit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark habit complete' });
  }
});

// Get all current streaks
router.get('/analytics/streaks', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.user?.id });

    const streaks = habits.map(h => ({
      habitId: h._id,
      name: h.name,
      icon: h.icon,
      currentStreak: h.currentStreak,
      longestStreak: h.longestStreak
    }));

    res.json({ streaks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streaks' });
  }
});

export default router;
