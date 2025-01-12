import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { toJson } from './parse-csv';
import { validateRequest, checkCache, rateLimiter } from './middlewares';
import { setCache } from './cache';
dotenv.config({ path: './.env' });

const app = express();
const port = 3000;
const BASE_URL = process.env.BASE_URL;
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300000', 10); // 5 minutes ttl

// Enable trust proxy
app.set('trust proxy', 1); // This trusts the first proxy (like Fly.io)
app.use(rateLimiter);

app.get(
    '/api/v1',
    async (req: Request, res: Response) => {
        res.send({
            'name': 'Stock Fetcher API',
            'version': '1.0.0',
        });
    },
);

app.get(
  '/api/v1/stocks/:market/:symbol',
  [validateRequest, checkCache],
  async (req: Request, res: Response) => {
    const { market, symbol } = req.params;
    const { start, end } = req.query;
    const cacheKey = `${market}_${symbol}_${start}_${end}`;

    try {
      const response = await fetch(`${BASE_URL}/${market}/${symbol.toUpperCase()}.csv`);
      const csvData = await response.text();

      const jsonData = toJson(
        csvData,
        symbol,
        market,
        parseInt(`${start}`, 10),
        parseInt(`${end}`, 10) || Infinity,
      );

      // Cache the response
      setCache(cacheKey, jsonData, CACHE_TTL);

      res.send(jsonData);
    } catch (error) {
      res.status(500).send({ error: 'Failed to fetch stock data' });
    }
  },
);

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
