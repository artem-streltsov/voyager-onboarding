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
Object.defineProperty(exports, "__esModule", { value: true });
const starknet_1 = require("starknet");
const dotenv_1 = require("dotenv");
const blocks_1 = require("./blocks/blocks");
const transactions_1 = require("./transactions/transactions");
(0, dotenv_1.config)();
const RPC_NODE_URL = process.env.RPC_NODE_URL;
const provider = new starknet_1.RpcProvider({ nodeUrl: RPC_NODE_URL });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function runSyncProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            try {
                const latestBlockNumber = yield provider.getBlockNumber();
                yield sleep(1000);
                console.log('Latest onchain block', latestBlockNumber);
                console.log('Starting block sync...');
                yield (0, blocks_1.runBlockSync)(provider, latestBlockNumber);
                console.log('Block sync completed.');
                console.log('Waiting for 1 minute before next sync...');
                yield sleep(60000);
                console.log('Starting transaction sync...');
                yield (0, transactions_1.runTransactionSync)(provider, latestBlockNumber);
                console.log('Transaction sync completed.');
                console.log('Waiting for 1 minute before next sync...');
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
runSyncProcess().catch(console.error);
