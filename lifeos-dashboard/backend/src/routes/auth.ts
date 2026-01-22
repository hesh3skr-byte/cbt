import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import { encrypt, decrypt } from '../utils/encryption';

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Create user
      const user = new User({
        email,
        passwordHash: password, // Will be hashed by pre-save hook
        name
      });

      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken({ id: user._id.toString(), email: user.email });
      const refreshToken = generateRefreshToken({ id: user._id.toString(), email: user.email });

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken({ id: user._id.toString(), email: user.email });
      const refreshToken = generateRefreshToken({ id: user._id.toString(), email: user.email });

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to login' });
    }
  }
);

// Refresh token
router.post('/refresh', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({ id: payload.id, email: payload.email });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        settings: {
          ...user.settings,
          whoopApiKey: user.settings.whoopApiKey ? '***' : undefined // Mask API key
        },
        dashboardLayout: user.dashboardLayout
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user settings
router.patch(
  '/settings',
  authenticate,
  [
    body('whoopApiKey').optional().isString(),
    body('timezone').optional().isString(),
    body('weekStartsOn').optional().isIn(['monday', 'sunday']),
    body('theme').optional().isIn(['light', 'dark', 'auto'])
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const user = await User.findById(req.user?.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Update settings
      const { whoopApiKey, timezone, weekStartsOn, theme } = req.body;

      if (whoopApiKey !== undefined) {
        user.settings.whoopApiKey = whoopApiKey ? encrypt(whoopApiKey) : '';
      }
      if (timezone) user.settings.timezone = timezone;
      if (weekStartsOn) user.settings.weekStartsOn = weekStartsOn;
      if (theme) user.settings.theme = theme;

      await user.save();

      res.json({
        message: 'Settings updated successfully',
        settings: {
          ...user.settings,
          whoopApiKey: user.settings.whoopApiKey ? '***' : undefined
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
);

export default router;
