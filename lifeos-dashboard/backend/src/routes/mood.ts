import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { MoodEntry } from '../models/MoodEntry';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { subDays } from 'date-fns';

const router = express.Router();
router.use(authenticate);

// Get mood entries
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

    const entries = await MoodEntry.find(filter).sort({ date: -1 });
    res.json({ entries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood entries' });
  }
});

// Create mood entry
router.post(
  '/',
  [
    body('date').isISO8601(),
    body('mood').isIn(['great', 'good', 'okay', 'low', 'struggling']),
    body('moodScore').isInt({ min: 1, max: 10 }),
    body('lifeBalanceRatings').isObject()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const entry = new MoodEntry({
        userId: req.user?.id,
        ...req.body
      });

      await entry.save();
      res.status(201).json({ entry });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create mood entry' });
    }
  }
);

// Update mood entry
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await MoodEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true }
    );

    if (!entry) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }

    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mood entry' });
  }
});

// Delete mood entry
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await MoodEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!entry) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }

    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
});

// Get 30-day mood trends
router.get('/trends/monthly', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const entries = await MoodEntry.find({
      userId: req.user?.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    const trendData = entries.map(e => ({
      date: e.date,
      moodScore: e.moodScore,
      mood: e.mood
    }));

    const avgMoodScore = entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.moodScore, 0) / entries.length)
      : 0;

    res.json({
      trendData,
      avgMoodScore,
      totalEntries: entries.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get latest life balance ratings
router.get('/life-balance/latest', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const latestEntry = await MoodEntry.findOne({ userId: req.user?.id })
      .sort({ date: -1 })
      .select('lifeBalanceRatings date');

    if (!latestEntry) {
      res.status(404).json({ error: 'No mood entries found' });
      return;
    }

    res.json({
      lifeBalanceRatings: latestEntry.lifeBalanceRatings,
      date: latestEntry.date
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch life balance' });
  }
});

export default router;
