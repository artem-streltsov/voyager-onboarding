import request from 'supertest';
import database_connection from "@voyager/database";
import axios from 'axios';
import app from "../src/app"

jest.mock('@voyager/database');
jest.mock('axios');

describe('Block API', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/block/:block_number', () => {
    it('should return block from database if it exists', async () => {
      const mockBlock = {
        block_number: 81325,
        block_hash: '0x42ad20de1709b141713f607005f764ba44f2d00d11594e62bc80b8cdbb10656',
        status: 'ACCEPTED_ON_L2',
        parent_hash: '0x6e2c62a4f99bcee94911ef25cc22fe37dda036c0c1af09471464c0fa04d37c7',
        new_root: '0x5e073cf081c4cef76216f03b8eb1d486fe6ab823ab580e58164fab6e95d45e3',
        timestamp: 1721191741,
        sequence_address: '0x1176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8',
        starknet_version: '0.13.1.1',
        l1_da_mode: 'BLOB',
        l1_data_gas_price_price_in_fri: '0x303bf7',
        l1_data_gas_price_price_in_wei: '0x186a0',
        l1_gas_price_price_in_fri: '0x9e114d226e4',
        l1_gas_price_price_in_wei: '0x762e04c4',
      };

      (database_connection.get as jest.Mock).mockImplementation((query, params, callback) => {
        callback(null, mockBlock);
      });

      const response = await request(app).get('/block/81325');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBlock);
    });

    it('should return 404 if block not in database and not available from RPC', async () => {
      (database_connection.get as jest.Mock).mockImplementation((query, params, callback) => {
        callback(null, null); // Block not in database
      });

      (axios.post as jest.Mock).mockResolvedValue({ data: { result: null } });

      const response = await request(app).get('/block/9999999999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'no block number 9999999999 present in the db or available from RPC' });
    });

    it('should return 400 for invalid block number', async () => {
      const response = await request(app).get('/block/invalid');

      expect(response.status).toBe(400);
    });
  });
});