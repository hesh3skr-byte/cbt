import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { WhoopService } from '../services/whoopService';
import { User } from '../models/User';
import { encrypt } from '../utils/encryption';

const router = express.Router();
const whoopService = new WhoopService();

router.use(authenticate);

// Connect Whoop (store API key)
router.post(
  '/connect',
  [body('apiKey').trim().notEmpty()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { apiKey } = req.body;
      const user = await User.findById(req.user?.id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.settings.whoopApiKey = encrypt(apiKey);
      await user.save();

      res.json({ message: 'Whoop connected successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to connect Whoop' });
    }
  }
);

// Sync Whoop data
router.get('/sync', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await whoopService.fetchDailyCycle(req.user?.id || '', new Date());

    if (!data) {
      res.status(404).json({ error: 'No Whoop data available' });
      return;
    }

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to sync Whoop data' });
  }
});

// Get weekly trends
router.get('/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trends = await whoopService.getWeeklyTrends(req.user?.id || '');
    res.json({ trends });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Whoop trends' });
  }
});

// Get specific day's recovery
router.get('/recovery/:date', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = new Date(req.params.date);
    const data = await whoopService.fetchDailyCycle(req.user?.id || '', date);

    if (!data) {
      res.status(404).json({ error: 'No data for this date' });
      return;
    }

    res.json({ recovery: data.recovery, date });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recovery data' });
  }
});

// Disconnect Whoop
router.delete('/disconnect', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.settings.whoopApiKey = '';
    await user.save();

    res.json({ message: 'Whoop disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect Whoop' });
  }
});

export default router;
