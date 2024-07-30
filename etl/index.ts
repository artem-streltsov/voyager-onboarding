import { RpcProvider } from "starknet";
import { config } from "dotenv";
import { runBlockSync } from './blocks/blocks';
import { runTransactionSync } from './transactions/transactions';

config();

const RPC_NODE_URL = process.env.RPC_NODE_URL;
const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runSyncProcess() {
    while (true) {
        try {
            const latestBlockNumber = await provider.getBlockNumber();
            await sleep(1000);
            console.log('Latest onchain block', latestBlockNumber);

            console.log('Starting block sync...');
            await runBlockSync(provider, latestBlockNumber);
            console.log('Block sync completed.');

            console.log('Waiting for 1 minute before next sync...');
            await sleep(60000);

            console.log('Starting transaction sync...');
            await runTransactionSync(provider, latestBlockNumber);
            console.log('Transaction sync completed.');

            console.log('Waiting for 1 minute before next sync...');
            await sleep(60000);
        } catch (error) {
            console.error('An error occurred during sync:', error);
            console.log('Retrying in 1 minute...');
            await sleep(60000);
        }
    }
}

runSyncProcess().catch(console.error);