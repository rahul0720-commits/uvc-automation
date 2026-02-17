import { Router } from 'express';
import * as twitter from '../services/twitter.js';
import * as linkedin from '../services/linkedin.js';

const router = Router();

// --- Twitter OAuth ---

router.get('/twitter', (req, res) => {
  const { url } = twitter.getAuthUrl();
  res.redirect(url);
});

router.get('/twitter/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code or state');
    await twitter.handleCallback(code, state);
    res.redirect('/?connected=twitter');
  } catch (err) {
    next(err);
  }
});

// --- LinkedIn OAuth ---

// Store state temporarily (in production, use session)
let linkedinState = '';

router.get('/linkedin', (req, res) => {
  const { url, state } = linkedin.getAuthUrl();
  linkedinState = state;
  res.redirect(url);
});

router.get('/linkedin/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('Missing authorization code');
    await linkedin.handleCallback(code);
    res.redirect('/?connected=linkedin');
  } catch (err) {
    next(err);
  }
});

export default router;
