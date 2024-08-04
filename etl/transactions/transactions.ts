import { RpcProvider } from "starknet";
import db from "@voyager/database";

const transformObjectToSqlInsert = (obj: any) => {
	return Object.values(obj).join(", ")
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTransactions(provider: RpcProvider, blockNumber: number): Promise<any[]> {
    const block = await provider.getBlockWithTxHashes(blockNumber);
    return block?.transactions;
}

async function processBlockRange(provider: RpcProvider, startBlock: number, endBlock: number) {
    for(let current_block = startBlock; current_block <= endBlock; current_block++) {
        console.log('Syncing transactions in block ', current_block);
        let retries = 3;
        while (retries > 0) {
            try {
                const transactions = await fetchTransactions(provider, current_block);
                await processTransactions(provider, transactions, current_block);
                break;
            } catch (error) {
                console.error(`Error syncing transactions in block ${current_block}. Retries left: ${retries - 1}`);
                retries--;
                if (retries === 0) {
                    console.error(`Failed to sync transactions in block ${current_block} after 3 attempts`);
                } else {
                    await sleep(5000);
                }
            }
        }
    }
}

async function processTransactions(provider: RpcProvider, transactions: any[], block_number: number) {
    for (const transaction_hash of transactions) {
        let retries = 3;
        while (retries > 0) {
            try {
                const transaction = await provider.getTransaction(transaction_hash) as any;

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
                    transaction?.type, 
                    transaction?.version, 
                    transaction?.nonce, 
                    transaction?.sender_address,
                    transaction?.signature ? transformObjectToSqlInsert(transaction.signature) : null, 
                    transaction?.calldata ? transformObjectToSqlInsert(transaction.calldata) : null, 
                    transaction?.resource_bounds?.l1_gas?.max_amount, 
                    transaction?.resource_bounds?.l1_gas?.max_price_per_unit, 
                    transaction?.resource_bounds?.l2_gas?.max_amount, 
                    transaction?.resource_bounds?.l2_gas?.max_price_per_unit, 
                    transaction?.tip, 
                    transaction?.paymaster_data ? transformObjectToSqlInsert(transaction.paymaster_data): null, 
                    transaction?.account_deployment_data ? transformObjectToSqlInsert(transaction.account_deployment_data) : null, 
                    transaction?.nonce_data_availability_mode, 
                    transaction?.fee_data_availability_mode, 
                    transaction?.max_fee
                ];

                await new Promise<void>((resolve, reject) => {
                    const stmt = db.prepare(query);
                    stmt.run(params, function(err) {
                        if (err) {
                            console.error("Error inserting transaction:", err);
                            reject(err);
                        } else {
                            resolve();
                        }
                        stmt.finalize();
                    });
                });

                break;
            } catch (error) {
                console.error(`Error processing transaction ${transaction_hash}. Retries left: ${retries - 1}`);
                console.log(error)
                retries--;
                if (retries === 0) {
                    console.error(`Failed to process transaction ${transaction_hash} after 3 attempts`);
                } else {
                    await sleep(5000);
                }
            }
        }
    }
}

export const runTransactionSync = async (provider: RpcProvider, startBlock: number, endBlock: number) => {
	await processBlockRange(provider, startBlock, endBlock);
}