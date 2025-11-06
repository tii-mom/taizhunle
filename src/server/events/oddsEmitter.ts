import { EventEmitter } from 'events';

export type OddsStreamEvent = {
  sequence: number;
  marketId: string;
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  timestamp: number;
  side?: 'yes' | 'no';
  amount?: number;
  netContribution?: number;
  impactFee?: number;
  impactMultiplier?: number;
  feeAmount?: number;
};

const emitter = new EventEmitter();
emitter.setMaxListeners(2000);

export function emitOddsUpdate(event: OddsStreamEvent) {
  emitter.emit(event.marketId, event);
  emitter.emit('*', event);
}

export function subscribeOddsUpdates(marketId: string, listener: (event: OddsStreamEvent) => void) {
  emitter.on(marketId, listener);
  return () => {
    emitter.off(marketId, listener);
  };
}
