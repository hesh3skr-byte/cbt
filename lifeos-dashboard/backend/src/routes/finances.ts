import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Financial } from '../models/Financial';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const router = express.Router();
router.use(authenticate);

// Get all financials
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, startDate, endDate } = req.query;
    const filter: any = { userId: req.user?.id };

    if (type) filter.type = type;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const financials = await Financial.find(filter).sort({ date: -1 });
    res.json({ financials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financials' });
  }
});

// Create financial entry
router.post(
  '/',
  [
    body('type').isIn(['income', 'expense', 'budget']),
    body('category').trim().notEmpty(),
    body('amount').isNumeric(),
    body('date').isISO8601()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const financial = new Financial({
        userId: req.user?.id,
        ...req.body
      });

      await financial.save();
      res.status(201).json({ financial });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create financial entry' });
    }
  }
);

// Update financial entry
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const financial = await Financial.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { $set: req.body },
      { new: true }
    );

    if (!financial) {
      res.status(404).json({ error: 'Financial entry not found' });
      return;
    }

    res.json({ financial });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update financial entry' });
  }
});

// Delete financial entry
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const financial = await Financial.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!financial) {
      res.status(404).json({ error: 'Financial entry not found' });
      return;
    }

    res.json({ message: 'Financial entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete financial entry' });
  }
});

// Get monthly summary
router.get('/summary/monthly', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month } = req.query;
    const targetDate = month ? new Date(month as string) : new Date();
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const entries = await Financial.find({
      userId: req.user?.id,
      date: { $gte: start, $lte: end }
    });

    const income = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

    const byCategory = entries.reduce((acc: any, entry) => {
      if (entry.type === 'expense') {
        if (!acc[entry.category]) acc[entry.category] = 0;
        acc[entry.category] += entry.amount;
      }
      return acc;
    }, {});

    res.json({
      month: format(targetDate, 'yyyy-MM'),
      income,
      expenses,
      balance: income - expenses,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
