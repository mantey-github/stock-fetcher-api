import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { getCache } from './cache';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { market, symbol } = req.params;
  const { start, end } = req.query;

  if (!market || !symbol) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: 'Market and symbol are required.',
      },
    });
    return;
  }

  const startTimestamp = parseInt(`${start}`, 10);
  const endTimestamp = end ? parseInt(`${end}`, 10) : Infinity;

  if (isNaN(startTimestamp) || startTimestamp <= 0) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: 'Invalid input - start date. A valid Unix timestamp is required.',
      },
    });
    return;
  }

  if (end && (isNaN(endTimestamp) || endTimestamp <= 0)) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: 'Invalid input - end date. A valid Unix timestamp is required.',
      },
    });
    return;
  }

  if (startTimestamp > endTimestamp) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: `Invalid input - start date cannot be after end date. startDate = ${startTimestamp}, endDate = ${endTimestamp}`,
      },
    });
    return;
  }

  next();
};

const checkCache = (req: Request, res: Response, next: NextFunction) => {
  const { market, symbol } = req.params;
  const { start, end } = req.query;
  const cacheKey = `${market}_${symbol}_${start}_${end}`;

  // Check cache
  const cachedResponse = getCache(cacheKey);
  if (cachedResponse) {
    res.send(cachedResponse);
    return;
  }

  next();
};

const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // default 15 minutes
  max: RATE_LIMIT_MAX_REQUESTS, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true,
  legacyHeaders: false,
  handler: (request, response) => {
    response.status(429).json({
      error: {
        code: 'Too Many Requests',
        description: 'You have exceeded the request limit. Please try again later.',
      },
    });
  },
});

export { validateRequest, checkCache, rateLimiter };
