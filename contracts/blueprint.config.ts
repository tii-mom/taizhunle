import { Config } from '@ton/blueprint';
import * as dotenv from 'dotenv';

dotenv.config();

export const config: Config = {
    network: process.env.TON_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
};
