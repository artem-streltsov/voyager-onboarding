import * as z from "zod";

export const validPageSizes = [5, 10, 25, 100];

export const block = z.object({
  block_number: z.number(),
  block_hash: z.string(),
  status: z.string(),
  parent_hash: z.string(),
  new_root: z.string(),
  timestamp: z.string(),
  sequence_address: z.string(),
  starknet_version: z.string(),
  l1_da_mode : z.string(),
  l1_data_gas_price_price_in_fri : z.string(),
  l1_data_gas_price_price_in_wei : z.string(),
  l1_gas_price_price_in_fri : z.string(), 
  l1_gas_price_price_in_wei : z.string()
});

export type Block = z.infer<typeof block>;

export const blocksResponse = z.object({
  rows: z.array(block),
  meta: z.object({
    totalPages: z.number(),
    latestBlock: z.number(),
  })
});

export type BlocksResponse = z.infer<typeof blocksResponse>;
