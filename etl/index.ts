import { RpcProvider } from "starknet";
import { config } from "dotenv";
import { runBlockSync } from './blocks/blocks';
import { runTransactionSync } from './transactions/transactions';
import db from "@voyager/database";

config();

const RPC_NODE_URL = process.env.RPC_NODE_URL;
const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CHUNK_SIZE = 10;
const PAUSE_BETWEEN_CHUNKS = 5000;

async function runSyncProcess() {
    while (true) {
        try {
            const latestBlockNumber = await provider.getBlockNumber();
            console.log('Latest onchain block', latestBlockNumber);

            let currentBlock = await getCurrentSyncedBlock();
            if (!currentBlock) {
                currentBlock = 75000;
            }
            console.log("Current synced block", currentBlock);

            while (currentBlock < latestBlockNumber) {
                const endBlock = Math.min(currentBlock + CHUNK_SIZE, latestBlockNumber);

                console.log(`Syncing blocks from ${currentBlock + 1} to ${endBlock}`);
                await runBlockSync(provider, currentBlock + 1, endBlock);
                console.log('Block sync completed.');

                console.log(`Syncing transactions for blocks ${currentBlock + 1} to ${endBlock}`);
                await runTransactionSync(provider, currentBlock + 1, endBlock);
                console.log('Transaction sync completed.');

                currentBlock = endBlock;

                console.log(`Pausing for ${PAUSE_BETWEEN_CHUNKS / 1000} seconds before next chunk...`);
                await sleep(PAUSE_BETWEEN_CHUNKS);
            }

            console.log('Sync process completed. Waiting for 1 minute before checking for new blocks...');
            await sleep(60000);
        } catch (error) {
            console.error('An error occurred during sync:', error);
            console.log('Retrying in 1 minute...');
            await sleep(60000);
        }
    }
}

async function getCurrentSyncedBlock(): Promise<number> {
    return new Promise((resolve, reject) => {
        const query = `SELECT MAX(block_number) as max_block FROM blocks`;
        db.get(query, (err, row: { max_block: number | null }) => {
            if (err) {
                console.error("Error getting current synced block:", err);
                reject(err);
            } else {
                // If no blocks are synced yet, start from block 75000
                resolve(row.max_block !== null ? row.max_block-1 : 75000);
            }
        });
    });
}

runSyncProcess().catch(console.error);