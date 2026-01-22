import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { HealthRecord } from '../models/HealthRecord';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { subDays } from 'date-fns';

const router = express.Router();
router.use(authenticate);

// Get health records
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = { userId: req.user?.id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const records = await HealthRecord.find(filter).sort({ date: -1 });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

// Create health record
router.post(
  '/',
  [body('date').isISO8601()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const record = new HealthRecord({
        userId: req.user?.id,
        ...req.body
      });

      await record.save();
      res.status(201).json({ record });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create health record' });
    }
  }
);

// Update health record
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true }
    );

    if (!record) {
      res.status(404).json({ error: 'Health record not found' });
      return;
    }

    res.json({ record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update health record' });
  }
});

// Delete health record
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!record) {
      res.status(404).json({ error: 'Health record not found' });
      return;
    }

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete health record' });
  }
});

// Get weekly summary
router.get('/summary/weekly', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = subDays(new Date(), 7);
    const records = await HealthRecord.find({
      userId: req.user?.id,
      date: { $gte: sevenDaysAgo }
    });

    const workoutCount = records.filter(r => r.workout).length;
    const totalCalories = records
      .filter(r => r.nutrition)
      .reduce((sum, r) => sum + (r.nutrition?.calories || 0), 0);
    const avgCalories = workoutCount > 0 ? Math.round(totalCalories / workoutCount) : 0;

    res.json({
      workoutCount,
      avgCalories,
      weekStart: sevenDaysAgo.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
