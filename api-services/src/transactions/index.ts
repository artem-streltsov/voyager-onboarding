import express, { Router } from "express";
import database_connection from "@voyager/database";
import { type Transaction, validPageSizes } from "@voyager/common";
import z from "zod";
import axios from "axios";

const transactionParamsSchema = z.object({
  transaction_hash: z.string().startsWith('0x')
})

const transactionsParamsSchema = z.object({
  p: z.string().default('0'),
  ps: z.string().default('10')
})

const router: Router = express.Router();

async function fetchTransactionFromRPC(transactionHash: string): Promise<Transaction | null> {
  try {
    const response = await axios.post('https://free-rpc.nethermind.io/mainnet-juno', {
      "jsonrpc": "2.0",
      "method": "starknet_getTransactionByHash",
      "params": {
        "transaction_hash": transactionHash
      },
      "id": 1
    }
  );

    if (response.data.result) {
      const transaction = response.data.result;
      return {
        block_number: transaction.block_number,
        transaction_hash: transaction.transaction_hash,
        type: transaction.type,
        version: transaction.version,
        nonce: transaction.nonce,
        sender_address: transaction.sender_address,
        signature: transaction.signature,
        calldata: transaction.calldata,
        l1_gas_max_amount: transaction.resource_bounds?.l1_gas?.max_amount,
        l1_gas_max_price_per_unit: transaction.resource_bounds?.l1_gas?.max_price_per_unit,
        l2_gas_max_amount: transaction.resource_bounds?.l2_gas?.max_amount,
        l2_gas_max_price_per_unit: transaction.resource_bounds?.l2_gas?.max_price_per_unit,
        tip: transaction.tip,
        paymaster_data: transaction.paymaster_data,
        account_deployment_data: transaction.account_deployment_data,
        nonce_data_availability_mode: transaction.nonce_data_availability_mode,
        fee_data_availability_mode: transaction.fee_data_availability_mode,
        max_fee: transaction.max_fee
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching transaction from RPC:', error);
    return null;
  }
}

// Function to insert transaction into the database
function insertTransactionIntoDB(transaction: Transaction): Promise<void> {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO transactions (block_number, transaction_hash, type, version, nonce, sender_address, signature, calldata, l1_gas_max_amount, l1_gas_max_price_per_unit, l2_gas_max_amount, l2_gas_max_price_per_unit, tip, paymaster_data, account_deployment_data, nonce_data_availability_mode, fee_data_availability_mode, max_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
        transaction.block_number,
        transaction.transaction_hash,
        transaction.type,
        transaction.version,
        transaction.nonce,
        transaction.sender_address,
        transaction.signature,
        transaction.calldata,
        transaction.l1_gas_max_amount,
        transaction.l1_gas_max_price_per_unit,
        transaction.l2_gas_max_amount,
        transaction.l2_gas_max_price_per_unit,
        transaction.tip,
        transaction.paymaster_data,
        transaction.account_deployment_data,
        transaction.nonce_data_availability_mode,
        transaction.fee_data_availability_mode,
        transaction.max_fee
    ];

    database_connection.run(query, values, (err) => {
      if (err) {
        console.error('Error inserting transaction into DB:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

router.get("/transactions", async (req, res, next) => {
  const schemaRes = transactionsParamsSchema.safeParse({ p: req.query.p, ps: req.query.ps })

  if(!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const { ps, p } = schemaRes.data

  const page = parseInt(p);
  const pageSize = parseInt(ps);

  if(isNaN(page) || isNaN(pageSize)) {
    res.status(400).json({error: "failed to parse pageSize or page"})
    return
  }

  if (!validPageSizes.includes(pageSize)) {
    res.status(400).json({ error: `pageSize must be one of ${validPageSizes.join(", ")}` });
    return;
  }

  if (page < 0) {
    res.status(400).json({ error: "page must be a non-negative integer" });
    return;
  }

  var totalPages = 0;

  const totalQuery = `SELECT COUNT(*) as transactionCount FROM transactions`;
  database_connection.get(totalQuery, undefined, (err: any, totalResult: { transactionCount: number }) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "failed to load data from db" });
      return;
    }

    const totalTransactions = totalResult.transactionCount;
    totalPages = Math.ceil(totalTransactions / pageSize);
  });

  const query = `SELECT * FROM transactions ORDER BY block_number DESC LIMIT ${pageSize} OFFSET ${page*pageSize}`

  database_connection.all(query, undefined, (err:any, rows: Transaction[]) => {
    if(err != null) {
      console.log(err)
      res.status(404).json({error: "failed to load data from db"})
      return;
    } 
    if(!rows) {
      res.status(404).json({error: `no transactions present in the db`})
      return;
    }
    res.status(200).json({rows, meta: {totalPages: totalPages}})
    return;
  })
})

router.get("/transaction/:transaction_hash", async (req, res, next) => {
  const transaction_hash = req.params.transaction_hash;

  const schemaRes = transactionParamsSchema.safeParse({transaction_hash})

  if(!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const query = `SELECT * FROM transactions WHERE transaction_hash = ?`

  database_connection.get(query, [schemaRes.data.transaction_hash], async (err, row: Transaction) => {
    if(err != null) {
      console.log(err)
      res.status(404).json({error: "failed to load data from db"})
      return;
    } 
    if(!row) {
      // Block not found in DB, try fetching from RPC
      const rpcBlock = await fetchTransactionFromRPC(schemaRes.data.transaction_hash);
      if (rpcBlock) {
        // Block fetched successfully, insert into DB and return to user
        try {
          await insertTransactionIntoDB(rpcBlock);
          res.status(200).json(rpcBlock);
        } catch (insertError) {
          console.error('Error inserting transaction into DB:', insertError);
          res.status(200).json(rpcBlock); // Still return the block to the user
        }
      } else {
        res.status(404).json({error: `no transaction with hash ${transaction_hash} present in the db or available from RPC`})
      }
      return;
    }
    res.status(200).json(row)
    return;
  })
})

export default router