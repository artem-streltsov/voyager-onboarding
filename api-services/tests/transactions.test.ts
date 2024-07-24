import request from 'supertest';
import database_connection from "@voyager/database";
import axios from 'axios';
import app from "../src/app"

jest.mock('@voyager/database');
jest.mock('axios');

describe('Transaction API', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/transaction/:transaction_hash', () => {
    it('should return transaction from database if it exists', async () => {
      const mockBlock = {
        transaction_hash: '0x7d1de9a99c26b2e277075d93f4aefc2b5eab154dc128879a64241b5da6a68e6',
        block_number: 660431,
        type: 'INVOKE',
        version: '0x1',
        nonce: '0x35',
        sender_address: '0x07b5cbbf4a8006906e069e2e712bc869d64457d2a663c77843acad54565a5267',
        signature: '0xe3c34ec43bf4aa92752b3591a21c205253e8013e98cebfaeacf0a7af9bad6d, 0x6a864831a0fb21bcb0fa05dede51ed340e4960d4e6433c890744928fb87c4d0',
        calldata: ,
        resource_bounds: ,
        tip: ,
        paymaster_data: ,
        account_deployment_data: ,
        nonce_data_availability_mode: ,
        fee_data_availability_mode: ,
        max_fee: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
      };

      (database_connection.get as jest.Mock).mockImplementation((query, params, callback) => {
        callback(null, mockBlock);
      });

      const response = await request(app).get('/transaction/0x7d1de9a99c26b2e277075d93f4aefc2b5eab154dc128879a64241b5da6a68e6');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBlock);
    });

    it('should return 404 if transaction not in database and not available from RPC', async () => {
      (database_connection.get as jest.Mock).mockImplementation((query, params, callback) => {
        callback(null, null); // Transaction not in database
      });

      (axios.post as jest.Mock).mockResolvedValue({ data: { result: null } });

      const response = await request(app).get('/transaction/0x000111000111000111000111000111000111000111000111000111000111000');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'no transaction with hash 0x000111000111000111000111000111000111000111000111000111000111000 present in the db or available from RPC' });
    });

    it('should return 400 for invalid transaction hash', async () => {
      const response = await request(app).get('/transaction/invalid');

      expect(response.status).toBe(400);
    });
  });
});