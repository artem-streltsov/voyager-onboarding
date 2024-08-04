import { RpcProvider } from "starknet";
import db from "@voyager/database";

type SqlTableType = {
	status: string,
	block_hash: string,
	parent_hash: string,
	block_number: number,
	new_root: string,
	timestamp: number,
	sequence_address: string,
	starknet_version: string,
	l1_da_mode: string,
	l1_data_gas_price_price_in_fri: string,
	l1_data_gas_price_price_in_wei: string,
	l1_gas_price_price_in_fri: string, 
	l1_gas_price_price_in_wei: string,
}

const transformObjectToSqlInsert = (obj: any) => {
	return { 
		columns: Object.keys(obj).join(", "),
		values: Object.values(obj).map(v => `'${v}'`).join(", ")
	}
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const syncBlockRange = async (provider: RpcProvider, start: number, end: number) => {
	for(let current_block = start; current_block <= end; current_block++) {
		console.log(`Syncing block: ${current_block}`)
		let retries = 3;
		while (retries > 0) {
			try {
				const latestBlockDetails: any = await provider.getBlockWithTxs(current_block);

				const insertSqlBlock: SqlTableType = {
					status: latestBlockDetails.status,
					block_hash: latestBlockDetails.block_hash,
					parent_hash: latestBlockDetails.parent_hash,
					block_number: latestBlockDetails.block_number,
					new_root: latestBlockDetails.new_root,
					timestamp: latestBlockDetails.timestamp,
					sequence_address: latestBlockDetails.sequencer_address,
					starknet_version: latestBlockDetails.starknet_version,
					l1_da_mode: latestBlockDetails.l1_da_mode,
					l1_data_gas_price_price_in_fri: latestBlockDetails?.l1_data_gas_price?.price_in_fri,
					l1_data_gas_price_price_in_wei: latestBlockDetails?.l1_data_gas_price?.price_in_wei,
					l1_gas_price_price_in_fri: latestBlockDetails?.l1_gas_price?.price_in_fri,
					l1_gas_price_price_in_wei: latestBlockDetails?.l1_gas_price?.price_in_wei,
				}

				const { columns, values } = transformObjectToSqlInsert(insertSqlBlock)

				await new Promise<void>((resolve, reject) => {
					const stmt = db.prepare(`INSERT OR REPLACE INTO blocks (${columns}) VALUES(${values})`);
					stmt.run(function(err) {
						if(err) {
							console.error("Failed to insert data", err);
							reject(err);
						} else {
							resolve();
						}
						stmt.finalize();
					});
				});

				break;
			} catch (error) {
				console.error(`Error syncing block ${current_block}. Retries left: ${retries - 1}`);
				retries--;
				if (retries === 0) {
					console.error(`Failed to sync block ${current_block} after 3 attempts`);
				} else {
					await sleep(5000);
				}
			}
		}
	}
}

export const runBlockSync = async (provider: RpcProvider, startBlock: number, endBlock: number) => {
	await syncBlockRange(provider, startBlock, endBlock);
}