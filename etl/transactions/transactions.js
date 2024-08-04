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
exports.runTransactionSync = void 0;
const database_1 = __importDefault(require("@voyager/database"));
const transformObjectToSqlInsert = (obj) => {
    return Object.values(obj).join(", ");
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function fetchTransactions(provider, blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield provider.getBlockWithTxHashes(blockNumber);
        return block === null || block === void 0 ? void 0 : block.transactions;
    });
}
function processBlockRange(provider, startBlock, endBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let current_block = startBlock; current_block <= endBlock; current_block++) {
            console.log('Syncing transactions in block ', current_block);
            let retries = 3;
            while (retries > 0) {
                try {
                    const transactions = yield fetchTransactions(provider, current_block);
                    yield processTransactions(provider, transactions, current_block);
                    break;
                }
                catch (error) {
                    console.error(`Error syncing transactions in block ${current_block}. Retries left: ${retries - 1}`);
                    retries--;
                    if (retries === 0) {
                        console.error(`Failed to sync transactions in block ${current_block} after 3 attempts`);
                    }
                    else {
                        yield sleep(5000);
                    }
                }
            }
        }
    });
}
function processTransactions(provider, transactions, block_number) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        for (const transaction_hash of transactions) {
            let retries = 3;
            while (retries > 0) {
                try {
                    const transaction = yield provider.getTransaction(transaction_hash);
                    const query = `
                    INSERT OR REPLACE INTO transactions (
                        transaction_hash, block_number, type, version, nonce, sender_address, signature, calldata,
                        l1_gas_max_amount, l1_gas_max_price_per_unit, l2_gas_max_amount, l2_gas_max_price_per_unit,
                        tip, paymaster_data, account_deployment_data,
                        nonce_data_availability_mode, fee_data_availability_mode, max_fee
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                    const params = [
                        transaction_hash,
                        block_number,
                        transaction === null || transaction === void 0 ? void 0 : transaction.type,
                        transaction === null || transaction === void 0 ? void 0 : transaction.version,
                        transaction === null || transaction === void 0 ? void 0 : transaction.nonce,
                        transaction === null || transaction === void 0 ? void 0 : transaction.sender_address,
                        (transaction === null || transaction === void 0 ? void 0 : transaction.signature) ? transformObjectToSqlInsert(transaction.signature) : null,
                        (transaction === null || transaction === void 0 ? void 0 : transaction.calldata) ? transformObjectToSqlInsert(transaction.calldata) : null,
                        (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.resource_bounds) === null || _a === void 0 ? void 0 : _a.l1_gas) === null || _b === void 0 ? void 0 : _b.max_amount,
                        (_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.resource_bounds) === null || _c === void 0 ? void 0 : _c.l1_gas) === null || _d === void 0 ? void 0 : _d.max_price_per_unit,
                        (_f = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.resource_bounds) === null || _e === void 0 ? void 0 : _e.l2_gas) === null || _f === void 0 ? void 0 : _f.max_amount,
                        (_h = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.resource_bounds) === null || _g === void 0 ? void 0 : _g.l2_gas) === null || _h === void 0 ? void 0 : _h.max_price_per_unit,
                        transaction === null || transaction === void 0 ? void 0 : transaction.tip,
                        (transaction === null || transaction === void 0 ? void 0 : transaction.paymaster_data) ? transformObjectToSqlInsert(transaction.paymaster_data) : null,
                        (transaction === null || transaction === void 0 ? void 0 : transaction.account_deployment_data) ? transformObjectToSqlInsert(transaction.account_deployment_data) : null,
                        transaction === null || transaction === void 0 ? void 0 : transaction.nonce_data_availability_mode,
                        transaction === null || transaction === void 0 ? void 0 : transaction.fee_data_availability_mode,
                        transaction === null || transaction === void 0 ? void 0 : transaction.max_fee
                    ];
                    yield new Promise((resolve, reject) => {
                        const stmt = database_1.default.prepare(query);
                        stmt.run(params, function (err) {
                            if (err) {
                                console.error("Error inserting transaction:", err);
                                reject(err);
                            }
                            else {
                                resolve();
                            }
                            stmt.finalize();
                        });
                    });
                    break;
                }
                catch (error) {
                    console.error(`Error processing transaction ${transaction_hash}. Retries left: ${retries - 1}`);
                    console.log(error);
                    retries--;
                    if (retries === 0) {
                        console.error(`Failed to process transaction ${transaction_hash} after 3 attempts`);
                    }
                    else {
                        yield sleep(5000);
                    }
                }
            }
        }
    });
}
const runTransactionSync = (provider, startBlock, endBlock) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Syncing transactions for blocks from ${startBlock} to ${endBlock}`);
    yield processBlockRange(provider, startBlock, endBlock);
});
exports.runTransactionSync = runTransactionSync;
