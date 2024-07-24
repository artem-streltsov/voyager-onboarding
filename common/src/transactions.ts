import * as z from "zod";

export const transaction = z.object({
  block_number: z.number(),
  transaction_hash: z.string(),
  type: z.string(),
  version: z.string(),
  nonce: z.string(),
  sender_address: z.string(),
  signature: z.string(),
  calldata: z.string(),
  l1_gas_max_amount: z.string(),
  l1_gas_max_price_per_unit: z.string(),
  l2_gas_max_amount: z.string(),
  l2_gas_max_price_per_unit: z.string(),
  tip: z.string(),
  paymaster_data: z.string(),
  account_deployment_data: z.string(),
  nonce_data_availability_mode: z.string(),
  fee_data_availability_mode: z.string(),
  max_fee: z.string()
});

export type Transaction = z.infer<typeof transaction>;

export const transactionResponse = z.object({
  rows: z.array(transaction),
  meta: z.object({
    totalPages: z.number()
  })
});

export type transactionResponse = z.infer<typeof transactionResponse>;
