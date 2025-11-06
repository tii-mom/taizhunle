import type { Request, Response } from 'express';
import { Router } from 'express';

import { subscribeOddsUpdates, type OddsStreamEvent } from '../events/oddsEmitter.js';
import { fetchLatestOddsSequence, fetchOddsSequenceSince } from '../services/oddsSequenceService.js';
import { getMarketOdds } from '../services/marketService.js';

const router = Router();

function toEvent(row: { id: number; market_id: string; yes_odds: number; no_odds: number; yes_pool: number; no_pool: number; total_pool: number; created_at: string }): OddsStreamEvent {
  return {
    sequence: row.id,
    marketId: row.market_id,
    yesOdds: Number(row.yes_odds),
    noOdds: Number(row.no_odds),
    yesPool: Number(row.yes_pool),
    noPool: Number(row.no_pool),
    totalPool: Number(row.total_pool),
    timestamp: new Date(row.created_at).getTime(),
  } satisfies OddsStreamEvent;
}

function parseLastEventId(req: Request): number | undefined {
  const headerValue = req.header('last-event-id');
  const queryValue = typeof req.query.lastEventId === 'string' ? req.query.lastEventId : undefined;
  const candidate = headerValue ?? queryValue;

  if (!candidate) {
    return undefined;
  }

  const parsed = Number(candidate);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function writeEvent(res: Response, event: OddsStreamEvent) {
  const payload = JSON.stringify(event);
  res.write(`id: ${event.sequence}\n`);
  res.write('event: odds\n');
  res.write(`data: ${payload}\n\n`);
}

router.get('/:marketId', async (req: Request, res: Response) => {
  const marketId = req.params.marketId?.trim();

  if (!marketId) {
    res.status(400).json({ error: 'Market id is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders?.();

  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  res.write('retry: 1000\n\n');

  let isClosed = false;
  let lastSequenceSent = parseLastEventId(req) ?? 0;
  let historyDelivered = false;
  const pending: OddsStreamEvent[] = [];

  const pushEvent = (event: OddsStreamEvent) => {
    if (isClosed) {
      return;
    }
    if (event.sequence <= lastSequenceSent) {
      return;
    }
    lastSequenceSent = event.sequence;
    try {
      writeEvent(res, event);
    } catch (error) {
      console.warn('Failed to write SSE odds event:', error);
    }
  };

  const listener = (event: OddsStreamEvent) => {
    if (historyDelivered) {
      pushEvent(event);
    } else {
      pending.push(event);
    }
  };

  const unsubscribe = subscribeOddsUpdates(marketId, listener);

  try {
    const lastEventId = lastSequenceSent;
    if (lastEventId > 0) {
      const sinceRows = await fetchOddsSequenceSince(marketId, lastEventId);
      for (const row of sinceRows) {
        const event = toEvent(row);
        pushEvent(event);
      }
    } else {
      const latestRow = await fetchLatestOddsSequence(marketId);

      if (latestRow) {
        pushEvent(toEvent(latestRow));
      } else {
        const snapshot = await getMarketOdds(marketId).catch((error) => {
          console.error('Failed to load market odds snapshot:', error);
          return null;
        });

        if (snapshot) {
          pushEvent({
            sequence: Date.now(),
            marketId,
            yesOdds: snapshot.yesOdds,
            noOdds: snapshot.noOdds,
            yesPool: snapshot.yesPool,
            noPool: snapshot.noPool,
            totalPool: snapshot.totalPool,
            timestamp: Date.now(),
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to send initial odds history:', error);
  }

  historyDelivered = true;

  if (pending.length > 0) {
    pending.splice(0).forEach((event) => {
      pushEvent(event);
    });
  }

  const keepAlive = setInterval(() => {
    if (isClosed) {
      return;
    }
    res.write(': keep-alive\n\n');
  }, 15000);

  req.on('close', () => {
    isClosed = true;
    clearInterval(keepAlive);
    unsubscribe();
  });
});

export default router;
