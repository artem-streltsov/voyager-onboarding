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
        sender_address: '0x7b5cbbf4a8006906e069e2e712bc869d64457d2a663c77843acad54565a5267',
        signature: [
          "0xe3c34ec43bf4aa92752b3591a21c205253e8013e98cebfaeacf0a7af9bad6d",
          "0x6a864831a0fb21bcb0fa05dede51ed340e4960d4e6433c890744928fb87c4d0"
        ],
        calldata: [
          "0x2",
          "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          "0x219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
          "0x3",
          "0x4270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f",
          "0x5e1885",
          "0x0",
          "0x4270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f",
          "0x1171593aa5bdadda4d6b0efde6cc94ee7649c3163d5efeb19da6c16d63a2a63",
          "0x13",
          "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          "0x5e1885",
          "0x0",
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          "0x643d0abcbd297",
          "0x0",
          "0x63bcbc9a83e56",
          "0x0",
          "0x7b5cbbf4a8006906e069e2e712bc869d64457d2a663c77843acad54565a5267",
          "0x0",
          "0x3e90652c3fe1f5f42578ffefca7fb00c88d4d18b5fb2bbeeee1a0d0d7d7d82d",
          "0x1",
          "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          "0x1114c7103e12c2b2ecbd3a2472ba9c48ddcbf702b1c242dd570057e26212111",
          "0x64",
          "0x2",
          "0x71273c5c5780b4be42d9e6567b1b1a6934f43ab8abaf975c0c3da219fc4d040",
          "0x60354d04b6dffe563b"
        ],
        max_fee: '0x190810a0c29'
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