"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const starknet_1 = require("starknet");
const dotenv_1 = require("dotenv");
const blocks_1 = require("./blocks/blocks");
const transactions_1 = require("./transactions/transactions");
const database_1 = __importDefault(require("@voyager/database"));
(0, dotenv_1.config)();
const RPC_NODE_URL = process.env.RPC_NODE_URL;
const provider = new starknet_1.RpcProvider({ nodeUrl: RPC_NODE_URL });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const CHUNK_SIZE = 10;
const PAUSE_BETWEEN_CHUNKS = 5000;
function runSyncProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            try {
                const latestBlockNumber = yield provider.getBlockNumber();
                console.log('Latest onchain block', latestBlockNumber);
                let currentBlock = yield getCurrentSyncedBlock();
                if (!currentBlock) {
                    currentBlock = 75000;
                }
                console.log("Current synced block", currentBlock);
                while (currentBlock < latestBlockNumber) {
                    const endBlock = Math.min(currentBlock + CHUNK_SIZE, latestBlockNumber);
                    console.log(`Syncing blocks from ${currentBlock + 1} to ${endBlock}`);
                    yield (0, blocks_1.runBlockSync)(provider, currentBlock + 1, endBlock);
                    console.log('Block sync completed.');
                    console.log(`Syncing transactions for blocks ${currentBlock + 1} to ${endBlock}`);
                    yield (0, transactions_1.runTransactionSync)(provider, currentBlock + 1, endBlock);
                    console.log('Transaction sync completed.');
                    currentBlock = endBlock;
                    console.log(`Pausing for ${PAUSE_BETWEEN_CHUNKS / 1000} seconds before next chunk...`);
                    yield sleep(PAUSE_BETWEEN_CHUNKS);
                }
                console.log('Sync process completed. Waiting for 1 minute before checking for new blocks...');
                yield sleep(60000);
            }
            catch (error) {
                console.error('An error occurred during sync:', error);
                console.log('Retrying in 1 minute...');
                yield sleep(60000);
            }
        }
    });
}
function getCurrentSyncedBlock() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const query = `SELECT MAX(block_number) as max_block FROM blocks`;
            database_1.default.get(query, (err, row) => {
                if (err) {
                    console.error("Error getting current synced block:", err);
                    reject(err);
                }
                else {
                    // If no blocks are synced yet, start from block 75000
                    resolve(row.max_block !== null ? row.max_block : 75000);
                }
            });
        });
    });
}
runSyncProcess().catch(console.error);
