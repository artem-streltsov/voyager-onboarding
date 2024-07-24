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
	for(
		let current_block = end; 
		current_block > start && current_block <= end; 
		current_block--
	) {
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
					db.run(`INSERT OR REPLACE INTO blocks (${columns}) VALUES(${values})`, undefined, (err) => {
						if(err) {
							console.error("Failed to insert data", err);
							reject(err);
						} else {
							resolve();
						}
					});
				});

				break; // If successful, break out of the retry loop
			} catch (error) {
				console.error(`Error syncing block ${current_block}. Retries left: ${retries - 1}`);
				retries--;
				if (retries === 0) {
					console.error(`Failed to sync block ${current_block} after 3 attempts`);
				} else {
					await sleep(1000); // Wait for 1 second before retrying
				}
			}
		}
	}
}

const CHUNK_SIZE = 100;
const chunking = async (provider: RpcProvider, start: number, end: number) => {
	const tasks: Promise<any>[] = []
	if(start >= end) return;

	let task_index = end;
	if(end-start > CHUNK_SIZE) {
		for( ;task_index > start; task_index -= CHUNK_SIZE) {
			tasks.push(syncBlockRange(provider, task_index - CHUNK_SIZE, task_index))
		}
	}
	if(task_index <= 0) {
		// "PROCESS REST RANGE", 0, CHUNK_SIZE + task_index
		tasks.push(syncBlockRange(provider, 0, task_index + CHUNK_SIZE))
	}
	if(end-start <= CHUNK_SIZE) {
		tasks.push(syncBlockRange(provider, start, end))
	}
	await Promise.all(tasks)
}

// Setting default start in case of no db it will sync block upto default block.
// Make it 0 if want to sync all blocks
const DEFAULT_START = 67000;
export const runBlockSync = async (provider: RpcProvider, latestBlockNumber: number) => {
	console.log("Latest onchain block", latestBlockNumber)

	const MAXIMUM_SELECTOR = 'MAX(block_number)';

  	const query = `SELECT ${MAXIMUM_SELECTOR} FROM blocks`
	return new Promise<void>((resolve, reject) => {
		db.get(query, undefined, async (err: any, row: any) => {
			if(err) {
				console.log(err);
				reject(err);
			}
			const latestSyncedBlock = row[MAXIMUM_SELECTOR]
			console.log("Sync blocks from-to" , `(${latestSyncedBlock ?? DEFAULT_START}, ${latestBlockNumber})`)
			try {
				await chunking(provider, latestSyncedBlock ?? DEFAULT_START, latestBlockNumber);
				resolve();
			} catch (error) {
				reject(error);
			}
		})
	});
}