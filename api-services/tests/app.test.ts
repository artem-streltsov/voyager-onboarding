import request from "supertest";
import { Express } from 'express';
import app from "../src/app"

let server: Express

describe('APP should say "Server is running!!!"', () => {
  beforeAll(() => {
    server = app;
  });

  it('should return 200',  (done) => {
    request(server)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'message': `Server is running!!!`})
        done()
      })
  });
});

describe('Blocks endpoint', () => {
  it('should return a list of blocks', (done) => {
    request(server)
      .get('/blocks')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(Array.isArray(res.body.rows)).toBeTruthy()
        done()
      })
  });
});

describe('Block by number endpoint', () => {
  it('should return a specific block when given a valid block number', (done) => {
    const blockNumber = 81180
    request(server)
      .get(`/block/${blockNumber}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('block_number', blockNumber)
        done()
      })
  });

  it('should return 404 for non-existent block numbers', (done) => {
    const nonExistentBlockNumber = 999999999 // Assuming this block number doesn't exist
    request(server)
      .get(`/block/${nonExistentBlockNumber}`)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('error')
        done()
      })
  });

  it('should handle invalid block numbers', (done) => {
    request(server)
      .get('/block/invalid')
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toHaveProperty('issues')
        done()
      })
  });
});