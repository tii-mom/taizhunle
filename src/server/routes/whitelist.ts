import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';

const router = Router();
const SNAPSHOT_FILE = process.env.WHITELIST_SNAPSHOT_PATH || path.resolve('whitelist_quota.json');

type QuotaEntry = {
  wallet: string;
  quota: number;
  proof?: string | null;
};

function readSnapshot(): QuotaEntry[] {
  if (!fs.existsSync(SNAPSHOT_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as QuotaEntry[];
    }
  } catch (error) {
    console.warn('Failed to parse whitelist snapshot:', error);
  }
  return [];
}

router.get('/status', (_req, res) => {
  res.json({
    active: false,
    total: 0,
    sold: 0,
    remaining: 0,
    baselinePrice: 0,
    currentPrice: 0,
    windowEnd: 0,
  });
});

router.get('/quota', (req, res) => {
  const wallet = typeof req.query.wallet === 'string' ? req.query.wallet.toLowerCase() : '';
  if (!wallet) {
    res.status(400).json({ error: 'wallet is required' });
    return;
  }

  const entries = readSnapshot();
  const match = entries.find((entry) => entry.wallet.toLowerCase() === wallet);

  if (!match) {
    res.json({ wallet, quota: 0, proof: null });
    return;
  }

  res.json({ wallet, quota: match.quota, proof: match.proof ?? null });
});

export default router;
