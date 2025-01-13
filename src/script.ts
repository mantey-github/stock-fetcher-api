import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { toJson } from './parse-csv';
import { validateRequest, checkCache, rateLimiter } from './middlewares';
import { setCache } from './cache';
dotenv.config({ path: './.env' });

const app = express();

const port = 3000;
const BASE_URL = process.env.BASE_URL;
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300000', 10); // 5 minutes ttl

// Troubleshooting Proxy Issues
// https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues
app.use(rateLimiter);

app.get('/api/v1', async (req: Request, res: Response) => {
  res.send({
    name: 'Stock Fetcher API',
    version: '1.0.0',
  });
});

app.get(
  '/api/v1/stocks/:market/:symbol',
  [validateRequest, checkCache],
  async (req: Request, res: Response, next: NextFunction) => {
    const { market, symbol } = req.params;
    const { start, end } = req.query as { start: string; end?: string };
    const cacheKey = `${market}_${symbol}_${start}_${end}`;

    try {
      const response = await fetch(
        `${BASE_URL}/${market.toLowerCase()}/${symbol.toUpperCase()}.csv`,
      );
      if (!response.ok) {
        return next({
          status: 404,
          message: `Stock data for symbol ${symbol.toUpperCase()} in market ${market.toUpperCase()} not found.`,
        });
      }

      const jsonData = toJson(await response.text(), symbol, market, start, end);

      // Cache the response
      setCache(cacheKey, jsonData, CACHE_TTL);

      res.send(jsonData);
    } catch (error) {
      next({
        status: 500,
        message: 'Failed to fetch stock data.',
        details: JSON.stringify(error),
      });
    }
  },
);

// Error Handler
app.use((err: any, req: Request, res: Response) => {
  res.status(err.status || 500).json({
    error: {
      code: err.status || 500,
      message: err.message || 'An unexpected error occurred.',
      details: err.details || null,
    },
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
