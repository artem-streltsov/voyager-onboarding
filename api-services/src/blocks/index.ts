import express, { Router } from "express";
import database_connection from "@voyager/database";
import { type Block, validPageSizes } from "@voyager/common";
import z from "zod";
import axios from "axios";

const blockParamsSchema = z.object({
  block_number: z.number()
})

const blockHashParamsSchema = z.object({
  block_hash: z.string().startsWith('0x')
})

const blocksParamsSchema = z.object({
  p: z.string().default('1'),
  ps: z.string().default('10')
})

const router: Router = express.Router();

async function fetchBlockFromRPC(blockNumber: number): Promise<Block | null> {
  try {
    const response = await axios.post('https://free-rpc.nethermind.io/mainnet-juno', {
      "jsonrpc": "2.0",
      "method": "starknet_getBlockWithTxHashes",
      "params": {
          "block_id": {
              "block_number": blockNumber
          }
      },
      "id": 1
    }
    
  );

    if (response.data.result) {
      const block = response.data.result;
      return {
        block_number: block.block_number,
        block_hash: block.block_hash,
        status: block.status,
        parent_hash: block.parent_hash,
        new_root: block.new_root,
        timestamp: block.timestamp,
        sequence_address: block.sequencer_address,
        starknet_version: block.starknet_version,
        l1_da_mode: block.l1_da_mode,
        l1_data_gas_price_price_in_fri: block.price_in_fri,
        l1_data_gas_price_price_in_wei: block.price_in_wei,
        l1_gas_price_price_in_fri: block.l1_gas_price.price_in_fri,
        l1_gas_price_price_in_wei: block.l1_gas_price.price_in_wei,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching block from RPC:', error);
    return null;
  }
}

// Function to insert block into the database
function insertBlockIntoDB(block: Block): Promise<void> {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO blocks (block_hash, status, parent_hash, block_number, new_root, timestamp, sequence_address, starknet_version, l1_da_mode, l1_data_gas_price_price_in_fri, l1_data_gas_price_price_in_wei, l1_gas_price_price_in_fri, l1_gas_price_price_in_wei) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      block.block_hash,
      block.status,
      block.parent_hash,
      block.block_number,
      block.new_root,
      block.timestamp,
      block.sequence_address,
      block.starknet_version,
      block.l1_da_mode,
      block.l1_data_gas_price_price_in_fri,
      block.l1_data_gas_price_price_in_wei,
      block.l1_data_gas_price_price_in_fri,
      block.l1_data_gas_price_price_in_wei,
    ];

    database_connection.run(query, values, (err) => {
      if (err) {
        console.error('Error inserting block into DB:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

router.get("/blocks", async (req, res, next) => {
  const schemaRes = blocksParamsSchema.safeParse({ p: req.query.p, ps: req.query.ps })

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

  const totalQuery = `SELECT MAX(block_number) as maxBlockNumber FROM blocks`;
  database_connection.get(totalQuery, undefined, (err: any, totalResult: { maxBlockNumber: number }) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "failed to load data from db" });
      return;
    }

    const totalBlocks = totalResult.maxBlockNumber;
    totalPages = Math.ceil(totalBlocks / pageSize);
  });

  const query = `SELECT * FROM blocks ORDER BY block_number DESC LIMIT ${pageSize} OFFSET ${page*pageSize}`

  database_connection.all(query, undefined, (err:any, rows: Block[]) => {
    if(err != null) {
      console.log(err)
      res.status(404).json({error: "failed to load data from db"})
      return;
    } 
    if(!rows) {
      res.status(404).json({error: `no blocks present in the db`})
      return;
    }
    res.status(200).json({rows, meta: {totalPages: totalPages}})
    return;
  })
})

router.get("/block/:block_number", async (req, res, next) => {
  const block_number = req.params.block_number;

  const schemaRes = blockParamsSchema.safeParse({block_number: parseInt(block_number)})

  if(!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const query = `SELECT * FROM blocks WHERE block_number = ${schemaRes.data.block_number}`

  database_connection.get(query, undefined, async (err, row: Block) => {
    if(err != null) {
      console.log(err)
      res.status(404).json({error: "failed to load data from db"})
      return;
    } 
    if(!row) {
      // Block not found in DB, try fetching from RPC
      const rpcBlock = await fetchBlockFromRPC(schemaRes.data.block_number);
      if (rpcBlock) {
        // Block fetched successfully, insert into DB and return to user
        try {
          await insertBlockIntoDB(rpcBlock);
          res.status(200).json(rpcBlock);
        } catch (insertError) {
          console.error('Error inserting block into DB:', insertError);
          res.status(200).json(rpcBlock); // Still return the block to the user
        }
      } else {
        res.status(404).json({error: `no block number ${block_number} present in the db or available from RPC`})
      }
      return;
    }
    res.status(200).json(row)
    return;
  })
})

router.get("/block_hash/:block_hash", async (req, res, next) => {
  const block_hash = req.params.block_hash;

  const schemaRes = blockHashParamsSchema.safeParse({block_hash})

  if(!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const query = `SELECT * FROM blocks WHERE block_hash = ?`

  database_connection.get(query, [schemaRes.data.block_hash], (err, row: Block) => {
    if(err != null) {
      console.log(err)
      res.status(404).json({error: "failed to load data from db"})
      return;
    } 
    if(!row) {
      res.status(404).json({error: `no block with hash ${block_hash} present in the db`})
      return;
    }
    res.status(200).json(row)
    return;
  })
})

export default router